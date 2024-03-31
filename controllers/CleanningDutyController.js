const { CleaningDuty, User, sequelize } = require('../models');
const dto = require('lodash');
const CleaningDutiesResponseDTO = require('../DTOs/cleaningDutiesDTOs/cleaningDutiesResponseDTO');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

exports.arrangeCleaningDuties = async (req, res) => {
  try {
    let alreadyAssignedDate = await checkCleaningDutiesForCurrentMonth();
    // Get the current date
    const currentDate = new Date();

    // Clone the current date to avoid mutation
    let cleaningDate = new Date(currentDate);

    // if the month already has cleaning duties, start from the last assigned date
    if (alreadyAssignedDate == null) {
      // Set to the first day of the month
      cleaningDate.setDate(1);
    } else {
      alreadyAssignedDate = new Date(alreadyAssignedDate);
      cleaningDate = alreadyAssignedDate;
      cleaningDate.setDate(alreadyAssignedDate.getDate());
    }

    // Calculate the end of the month
    const endOfMonth = new Date(
      cleaningDate.getFullYear(),
      cleaningDate.getMonth() + 1,
      0
    );

    let totalDays = endOfMonth.getDate();

    if (alreadyAssignedDate != null) {
      totalDays = totalDays - alreadyAssignedDate.getDate();
      cleaningDate.setDate(alreadyAssignedDate.getDate() + 1);
    }

    // Query the database to get all users
    const users = await User.findAll({
      where: {
        is_admin: false,
      },
    });
    let clonedUsers = [...users]; // Clone the array of users

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Array to hold cleaning duties for the current and next month
      const cleaningDuties = [];

      for (let i = 1; i <= totalDays; i++) {
        // Skip Saturdays and Sundays
        if (cleaningDate.getDay() === 0 || cleaningDate.getDay() === 6) {
          cleaningDate.setDate(cleaningDate.getDate() + 1);
          continue;
        }

        // If all users have been assigned, renew the list
        if (clonedUsers.length === 0) {
          clonedUsers = [...users];
        }

        const cleaningDateForUser = new Date(cleaningDate)
          .toISOString()
          .split('T')[0];

        const user = clonedUsers.shift();

        cleaningDuties.push({
          cleaner_id: user.id,
          assign_date: cleaningDateForUser,
          cleaning_date: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Move to the next day
        cleaningDate.setDate(cleaningDate.getDate() + 1);
      }

      // Move remaining users to the next month if any
      if (clonedUsers.length > 0) {
        const nextMonth = new Date();
        if (alreadyAssignedDate !== null) {
          nextMonth.setMonth(alreadyAssignedDate.getMonth());
        } else {
          nextMonth.setMonth(nextMonth.getMonth() + 1);
        }
        nextMonth.setDate(1);

        let nextMonthDay = new Date(nextMonth);

        while (nextMonthDay.getDay() === 0 || nextMonthDay.getDay() === 6) {
          nextMonthDay.setDate(nextMonthDay.getDate() + 1);
        }

        clonedUsers.forEach((user) => {
          cleaningDuties.push({
            cleaner_id: user.id,
            assign_date: new Date(nextMonthDay),
            cleaning_date: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          do {
            nextMonthDay.setDate(nextMonthDay.getDate() + 1);
          } while (nextMonthDay.getDay() === 0 || nextMonthDay.getDay() === 6);
        });
      }

      // Bulk insert all cleaning duty records
      await CleaningDuty.bulkCreate(cleaningDuties, { transaction: t });
    });

    res
      .status(200)
      .json({ message: 'Cleaning duties arranged until the end of the month' });
  } catch (error) {
    console.error('Error arranging cleaning duties:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCleaningDuties = async (req, res) => {
  try {
    const { year, month } = req.params;
    let newDate = new Date(year, month - 1);
    newDate = moment(newDate).format('YYYY-MM-DD');

    // Calculate the end date dynamically based on the month
    const endDate = moment(newDate).endOf('month').format('YYYY-MM-DD');

    const cleaningDuties = await CleaningDuty.findAll({
      where: {
        assign_date: {
          [Op.between]: [newDate, endDate],
        },
      },
      include: {
        model: User,
        as: 'cleaner',
        attributes: ['id', 'email', 'avatar_url'],
      },
    });

    const cleaningDutiesResponse = cleaningDuties.map((cleaningDuty) => {
      return dto.pick(cleaningDuty, Object.values(CleaningDutiesResponseDTO));
    });

    res.status(200).json({ cleaningDutiesResponse });
  } catch (error) {
    console.error('Error getting cleaning duties:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.marksAsDone = async (req, res) => {
  try {
    const { cleaningDutyId } = req.params;
    const userId = req.app.locals.current_user.id;
    const cleaningDuty = await CleaningDuty.findByPk(cleaningDutyId);
    if (userId !== cleaningDuty.cleaner_id) {
      return res.status(401).json({ message: 'User is invalid' });
    }

    if (!cleaningDuty) {
      return res.status(404).json({ message: 'Cleaning duty not found' });
    }

    cleaningDuty.cleaning_date = new Date();
    await cleaningDuty.save();

    res.status(200).json({ message: 'Cleaning duty marked as done' });
  } catch (error) {
    console.error('Error marking cleaning duty as done:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

async function checkCleaningDutiesForCurrentMonth() {
  try {
    // Get the current date
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth());

    // Set to the first day of the month
    currentDate.setDate(1);

    // Calculate the end of the month
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Query the database to check if any cleaning duties exist for the current month
    const cleaningDuties = await CleaningDuty.findAll({
      where: {
        assign_date: {
          [Op.between]: [currentDate, endOfMonth],
        },
      },
    });

    if (cleaningDuties.length > 0) {
      // Get the last item in the array
      const lastCleaningDuty = cleaningDuties[cleaningDuties.length - 1];
      return lastCleaningDuty.assign_date;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
