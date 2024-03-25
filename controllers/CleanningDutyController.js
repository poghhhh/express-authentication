const { CleaningDuty, User, sequelize } = require('../models');
const dto = require('lodash');
const CleaningDutiesResponseDTO = require('../DTOs/cleaningDutiesDTOs/cleaningDutiesResponseDTO');
const { Op } = require('sequelize');

exports.arrangeCleaningDuties = async (req, res) => {
  try {
    const alreadyAssignedDate = await checkCleaningDutiesForCurrentMonth();
    // Get the current date
    const currentDate = new Date();

    // Clone the current date to avoid mutation
    const cleaningDate = new Date(currentDate);

    // if the month already has cleaning duties, start from the last assigned date
    if (alreadyAssignedDate == null) {
      // Set to the first day of the month
      cleaningDate.setDate(1);
    } else {
      // Set to the next day of the last assigned date
      cleaningDate.setDate(alreadyAssignedDate.getDate() + 1);
    }
    // Check if the first day of the month is Saturday or Sunday
    if (cleaningDate.getDay() === 6) {
      // 6 is Saturday
      // Move to Monday
      cleaningDate.setDate(cleaningDate.getDate() + 2);
    } else if (cleaningDate.getDay() === 0) {
      // 0 is Sunday
      // Move to Monday
      cleaningDate.setDate(cleaningDate.getDate() + 1);
    }

    // Calculate the end of the month
    const endOfMonth = new Date(
      cleaningDate.getFullYear(),
      cleaningDate.getMonth() + 1,
      0
    );

    let totalDays = endOfMonth.getDate();

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

      // Iterate over the days until the end of the month and assign cleaning duties
      const cleaningDay = new Date(cleaningDate);

      for (let i = 1; i <= totalDays; i++) {
        // Skip Saturdays and Sundays
        if (cleaningDay.getDay() === 0 || cleaningDay.getDay() === 6) {
          cleaningDay.setDate(cleaningDay.getDate() + 1);
          continue;
        }

        // If all users have been assigned, renew the list
        if (clonedUsers.length === 0) {
          clonedUsers = [...users];
        }

        const cleaningDateForUser = new Date(cleaningDay)
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
        cleaningDay.setDate(cleaningDay.getDate() + 1);
      }

      // Move remaining users to the next month if any
      if (clonedUsers.length > 0) {
        const nextMonth = new Date(cleaningDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
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
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const cleaningDuties = await CleaningDuty.findAll({
      where: {
        assign_date: {
          [Op.between]: [startDate, endDate],
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
async function checkCleaningDutiesForCurrentMonth() {
  try {
    // Get the current date
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth());

    // Set to the first day of the month
    currentDate.setDate(1);

    // Check if the first day of the month is Saturday or Sunday
    if (currentDate.getDay() === 6) {
      // 6 is Saturday
      // Move to Monday
      currentDate.setDate(currentDate.getDate() + 2);
    } else if (currentDate.getDay() === 0) {
      // 0 is Sunday
      // Move to Monday
      currentDate.setDate(currentDate.getDate() + 1);
    }

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
