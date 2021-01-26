# Postgres Functions and Tables Dumper
This script will dump your database functions and tables to compare production and development environments

## Setup
After cloning run `npm install`, then rename the `.env.example` file as `.env` and introduce your actual connection strings for **PROD** and **DEV** databases.

## Running
run with `npm start`, select the objects that you want to dump and it will generate the corresponding files on the output folder