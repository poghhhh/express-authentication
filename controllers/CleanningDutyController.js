const { CleaningDuty, User, sequelize } = require('../models');
const dto = require('lodash');
const CleaningDutiesResponseDTO = require('../DTOs/cleaningDutiesDTOs/cleaningDutiesResponseDTO');
const { Op } = require('sequelize');

exports.arrangeCleaningDuties = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();

    // Clone the current date to avoid mutation
    const cleaningDate = new Date(currentDate);

    // Set to the first day of the month
    cleaningDate.setDate(1);

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
    const users = await User.findAll();
    let clonedUsers = [...users]; // Clone the array of users

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Iterate over the days until the end of the month and assign cleaning duties
      const cleaningDuties = [];
      // Reset the cleaning day to the first day of the week
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

        const cleaningDateForUser = new Date(cleaningDay);

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

      // Bulk insert cleaning duty records
      await CleaningDuty.bulkCreate(cleaningDuties, { transaction: t });

      // Move to the next month
      cleaningDate.setMonth(cleaningDate.getMonth() + 1);
      // Reset the cleaning date to the first day of the month
      cleaningDate.setDate(1);
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
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const cleaningDuties = await CleaningDuty.findAll({
      where: {
        assign_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: {
        model: User,
        as: 'cleaner',
        attributes: ['id', 'email'],
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
