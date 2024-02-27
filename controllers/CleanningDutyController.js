const { CleaningDuty, User, sequelize } = require('../models');

exports.arrangeCleaningDuties = async (req, res) => {
  try {
    await CleaningDuty.destroy({ truncate: true });
    // Get the current date
    const currentDate = new Date();
    const cleaningDate = new Date(currentDate); // Clone the current date to avoid mutation

    // Find the first Monday of the current month
    cleaningDate.setDate(1); // Set to the first day of the month
    while (cleaningDate.getDay() !== 1) {
      // Move to the next day until it's Monday
      cleaningDate.setDate(cleaningDate.getDate() + 1);
    }

    // Calculate the end of the month
    const endOfMonth = new Date(
      cleaningDate.getFullYear(),
      cleaningDate.getMonth() + 1,
      0
    );

    // Query the database to get all users
    const users = await User.findAll();

    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Iterate over the days until the end of the month and assign cleaning duties
      while (cleaningDate <= endOfMonth) {
        // Prepare an array to hold cleaning duty records
        const cleaningDuties = [];
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          // Calculate the cleaning date for each user
          const cleaningDay = new Date(cleaningDate);
          cleaningDay.setDate(cleaningDay.getDate() + i); // Increment the date for each user
          // Skip assigning duties on weekends (Saturday and Sunday)
          if (cleaningDay.getDay() === 0 || cleaningDay.getDay() === 6) {
            continue; // Skip to the next user
          }
          cleaningDuties.push({
            cleaner_id: user.id,
            assign_date: cleaningDay,
            cleaning_date: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        // Bulk insert cleaning duty records
        await CleaningDuty.bulkCreate(cleaningDuties, { transaction: t });

        // Move to the next week
        cleaningDate.setDate(cleaningDate.getDate() + 7);
      }
    });

    res
      .status(200)
      .json({ message: 'Cleaning duties arranged until the end of the month' });
  } catch (error) {
    console.error('Error arranging cleaning duties:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
