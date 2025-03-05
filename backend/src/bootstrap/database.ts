import AppDataSource from './data-source'; // Import the DataSource instance

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

export default connectDB;
