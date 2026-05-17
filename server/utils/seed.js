/**
 * Run: node utils/seed.js
 * Creates demo accounts for hackathon judges to test all three roles.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Goal = require('../models/Goal');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Wipe existing demo data
  await User.deleteMany({ email: /@demo\.com$/ });
  await Goal.deleteMany({ quarter: 'Q1-2025' });

  // 1. Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'Demo@1234',
    role: 'admin',
    department: 'HR',
  });

  // 2. Manager
  const manager = await User.create({
    name: 'Priya Sharma',
    email: 'manager@demo.com',
    password: 'Demo@1234',
    role: 'manager',
    department: 'Engineering',
  });

  // 3. Employees
  const emp1 = await User.create({
    name: 'Rahul Verma',
    email: 'emp1@demo.com',
    password: 'Demo@1234',
    role: 'employee',
    department: 'Engineering',
    manager_id: manager._id,
  });

  const emp2 = await User.create({
    name: 'Sneha Patel',
    email: 'emp2@demo.com',
    password: 'Demo@1234',
    role: 'employee',
    department: 'Engineering',
    manager_id: manager._id,
  });

  // 4. Sample goals for emp1 (one approved/locked, one draft)
  await Goal.create([
    {
      employee_id: emp1._id,
      title: 'Complete 250 DSA problems',
      description: 'Solve problems across arrays, trees, graphs on LeetCode',
      thrust_area: 'Technical',
      uom_type: 'numeric',
      target: 250,
      weightage: 30,
      quarter: 'Q1-2025',
      status: 'locked',
      locked: true,
      deadline: new Date('2025-03-31'),
    },
    {
      employee_id: emp1._id,
      title: 'Build AI project',
      description: 'Develop and deploy a full-stack AI-powered application',
      thrust_area: 'Technical',
      uom_type: 'numeric',
      target: 1,
      weightage: 30,
      quarter: 'Q1-2025',
      status: 'locked',
      locked: true,
      deadline: new Date('2025-03-31'),
    },
    {
      employee_id: emp1._id,
      title: 'Maintain CGPA above 8.5',
      description: 'Academic performance goal',
      thrust_area: 'Academic',
      uom_type: 'numeric',
      target: 8.5,
      weightage: 20,
      quarter: 'Q1-2025',
      status: 'locked',
      locked: true,
    },
    {
      employee_id: emp1._id,
      title: 'Complete AWS certification',
      description: 'Pass the AWS Solutions Architect Associate exam',
      thrust_area: 'Technical',
      uom_type: 'zero_based',
      target: 0,
      weightage: 20,
      quarter: 'Q1-2025',
      status: 'locked',
      locked: true,
    },
  ]);

  // 5. Sample submitted goal for emp2 (pending manager approval)
  await Goal.create([
    {
      employee_id: emp2._id,
      title: 'Increase code review participation',
      description: 'Review at least 2 PRs per week',
      thrust_area: 'Process',
      uom_type: 'numeric',
      target: 50,
      weightage: 40,
      quarter: 'Q1-2025',
      status: 'submitted',
    },
    {
      employee_id: emp2._id,
      title: 'Zero production incidents',
      description: 'Ensure no P0 incidents due to own code',
      thrust_area: 'Quality',
      uom_type: 'zero_based',
      target: 0,
      weightage: 60,
      quarter: 'Q1-2025',
      status: 'submitted',
    },
  ]);

  console.log('\n✅ Seed complete. Demo accounts:');
  console.log('  Admin:   admin@demo.com   / Demo@1234');
  console.log('  Manager: manager@demo.com / Demo@1234');
  console.log('  Emp 1:   emp1@demo.com    / Demo@1234');
  console.log('  Emp 2:   emp2@demo.com    / Demo@1234');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
