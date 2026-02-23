CREATE DATABASE IF NOT EXISTS jalnetra;
USE jalnetra;

CREATE TABLE IF NOT EXISTS tankers (
    id VARCHAR(10) PRIMARY KEY,
    capacity INT DEFAULT 5000,
    status ENUM('AVAILABLE', 'EN-ROUTE', 'UNLOADING', 'MAINTENANCE', 'VERIFIED') DEFAULT 'AVAILABLE',
    current_village VARCHAR(255) DEFAULT NULL,
    assignment VARCHAR(255) DEFAULT NULL,
    is_secure BOOLEAN DEFAULT TRUE,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    otp VARCHAR(4) DEFAULT NULL,
    geofence VARCHAR(50) DEFAULT 'SECURE'
);

-- Reset and insert initial fleet
TRUNCATE TABLE tankers;
INSERT INTO tankers (id, capacity, status, current_village, assignment, is_secure, lat, lng, geofence) VALUES
('T-101', 5000, 'AVAILABLE', 'Nagpur HQ', NULL, TRUE, 21.1458, 79.0882, 'SECURE'),
('T-102', 10000, 'EN-ROUTE', 'Kalmeshwar', 'Katol', TRUE, 21.2, 78.8, 'SECURE'),
('T-103', 5000, 'AVAILABLE', 'Nagpur HQ', NULL, TRUE, 21.1458, 79.0882, 'SECURE'),
('T-104', 12000, 'UNLOADING', 'Hingna', 'Hingna', FALSE, 21.1147, 79.0304, 'SECURE'),
('T-105', 7500, 'AVAILABLE', 'Nagpur HQ', NULL, TRUE, 21.1458, 79.0882, 'SECURE');
