-- MySQL schema for Module_IDTech
-- Run this in MySQL Workbench (or mysql CLI) on localhost.

CREATE DATABASE IF NOT EXISTS module_idtech
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE module_idtech;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS plants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_plants_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(200) NOT NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(50) NULL,
  city VARCHAR(100) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_suppliers_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS moulds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  mould_code VARCHAR(50) NOT NULL,
  mould_name VARCHAR(255) NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  part_number VARCHAR(80) NOT NULL,
  plant_id BIGINT UNSIGNED NOT NULL,
  supplier_id BIGINT UNSIGNED NULL,
  cavity_count INT UNSIGNED NOT NULL DEFAULT 1,
  max_shots BIGINT UNSIGNED NOT NULL,
  current_shots BIGINT UNSIGNED NOT NULL DEFAULT 0,
  purchase_cost DECIMAL(12,2) NOT NULL,
  status ENUM('AT_SELF','AT_VENDOR','IN_TRANSIT','MAINTENANCE','RETIRED','SCRAPPED') NOT NULL DEFAULT 'AT_SELF',
  commissioned_on DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_moulds_code (mould_code),
  KEY idx_moulds_status (status),
  CONSTRAINT fk_moulds_plant FOREIGN KEY (plant_id) REFERENCES plants(id),
  CONSTRAINT fk_moulds_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS transfer_challans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  challan_no VARCHAR(50) NOT NULL,
  mould_id BIGINT UNSIGNED NOT NULL,
  from_entity VARCHAR(255) NOT NULL,
  to_entity VARCHAR(255) NOT NULL,
  transfer_type ENUM('OUTBOUND','INBOUND','INTERPLANT','MAINTENANCE') NOT NULL,
  status ENUM('IN_TRANSIT','RECEIVED','CANCELLED') NOT NULL DEFAULT 'IN_TRANSIT',
  dispatched_at DATETIME NOT NULL,
  received_at DATETIME NULL,
  remarks VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_transfer_challans_no (challan_no),
  KEY idx_transfer_challans_status (status),
  CONSTRAINT fk_transfer_challans_mould FOREIGN KEY (mould_id) REFERENCES moulds(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mould_returns (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  return_no VARCHAR(50) NOT NULL,
  transfer_challan_id BIGINT UNSIGNED NOT NULL,
  mould_id BIGINT UNSIGNED NOT NULL,
  return_condition ENUM('GOOD','NEEDS_SERVICE','DAMAGED') NOT NULL DEFAULT 'GOOD',
  returned_at DATETIME NOT NULL,
  accepted_by VARCHAR(120) NULL,
  remarks VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_mould_returns_no (return_no),
  CONSTRAINT fk_mould_returns_transfer FOREIGN KEY (transfer_challan_id) REFERENCES transfer_challans(id),
  CONSTRAINT fk_mould_returns_mould FOREIGN KEY (mould_id) REFERENCES moulds(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS maintenance_jobs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_no VARCHAR(50) NOT NULL,
  mould_id BIGINT UNSIGNED NOT NULL,
  vendor_id BIGINT UNSIGNED NULL,
  maintenance_type ENUM('PREVENTIVE','BREAKDOWN','REFURBISHMENT') NOT NULL,
  priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('OPEN','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'OPEN',
  opened_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  estimated_cost DECIMAL(12,2) NULL,
  actual_cost DECIMAL(12,2) NULL,
  notes VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_maintenance_jobs_no (job_no),
  KEY idx_maintenance_jobs_status (status),
  CONSTRAINT fk_maintenance_jobs_mould FOREIGN KEY (mould_id) REFERENCES moulds(id),
  CONSTRAINT fk_maintenance_jobs_vendor FOREIGN KEY (vendor_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS depreciation_entries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  mould_id BIGINT UNSIGNED NOT NULL,
  fiscal_year VARCHAR(9) NOT NULL,
  opening_value DECIMAL(12,2) NOT NULL,
  depreciation_percent DECIMAL(5,2) NOT NULL,
  depreciation_amount DECIMAL(12,2) NOT NULL,
  closing_value DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_depreciation_mould_year (mould_id, fiscal_year),
  CONSTRAINT fk_depreciation_entries_mould FOREIGN KEY (mould_id) REFERENCES moulds(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS scrap_records (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  scrap_no VARCHAR(50) NOT NULL,
  mould_id BIGINT UNSIGNED NOT NULL,
  reason ENUM('EOL','DAMAGED','OBSOLETE','LOST') NOT NULL,
  approved_by VARCHAR(120) NOT NULL,
  scrap_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  scrapped_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_scrap_records_no (scrap_no),
  CONSTRAINT fk_scrap_records_mould FOREIGN KEY (mould_id) REFERENCES moulds(id)
) ENGINE=InnoDB;
