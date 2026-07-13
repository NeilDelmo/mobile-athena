CREATE DATABASE IF NOT EXISTS `{{DB_NAME}}`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `{{DB_NAME}}`;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  university_id VARCHAR(50) NULL,
  google_subject VARCHAR(255) NULL,
  email VARCHAR(191) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('faculty', 'research_head', 'research_coordinator', 'vcrdes', 'admin') NOT NULL,
  department VARCHAR(150) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_university_id (university_id),
  UNIQUE KEY uq_users_google_subject (google_subject),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_active (role, is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS research_calls (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  opens_at DATETIME NULL,
  closes_at DATETIME NULL,
  status ENUM('draft', 'open', 'closed') NOT NULL DEFAULT 'draft',
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_research_calls_status_dates (status, opens_at, closes_at),
  CONSTRAINT fk_research_calls_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS announcements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  published_at DATETIME NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_announcements_visibility (status, is_featured, starts_at, ends_at),
  CONSTRAINT fk_announcements_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proposals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference_no VARCHAR(40) NOT NULL,
  faculty_id BIGINT UNSIGNED NOT NULL,
  research_call_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  abstract_text TEXT NOT NULL,
  keywords JSON NULL,
  study_type VARCHAR(100) NOT NULL,
  department VARCHAR(150) NOT NULL,
  status ENUM('draft', 'submitted', 'under_evaluation', 'revision_required', 'approved', 'rejected')
    NOT NULL DEFAULT 'draft',
  current_revision SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  submitted_at DATETIME NULL,
  decided_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_proposals_reference_no (reference_no),
  KEY idx_proposals_faculty_status (faculty_id, status),
  KEY idx_proposals_status_submitted (status, submitted_at),
  CONSTRAINT fk_proposals_faculty
    FOREIGN KEY (faculty_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_proposals_research_call
    FOREIGN KEY (research_call_id) REFERENCES research_calls (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proposal_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  proposal_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('manuscript', 'ethics', 'budget', 'supporting') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_proposal_documents_proposal (proposal_id, uploaded_at),
  CONSTRAINT fk_proposal_documents_proposal
    FOREIGN KEY (proposal_id) REFERENCES proposals (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_proposal_documents_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proposal_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  proposal_id BIGINT UNSIGNED NOT NULL,
  reviewer_id BIGINT UNSIGNED NOT NULL,
  decision ENUM('approved', 'revision_required', 'rejected') NOT NULL,
  comments TEXT NOT NULL,
  decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_proposal_reviews_proposal (proposal_id, decided_at),
  KEY idx_proposal_reviews_reviewer (reviewer_id, decided_at),
  CONSTRAINT fk_proposal_reviews_proposal
    FOREIGN KEY (proposal_id) REFERENCES proposals (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_proposal_reviews_reviewer
    FOREIGN KEY (reviewer_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proposal_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  proposal_id BIGINT UNSIGNED NOT NULL,
  from_status ENUM('draft', 'submitted', 'under_evaluation', 'revision_required', 'approved', 'rejected') NULL,
  to_status ENUM('draft', 'submitted', 'under_evaluation', 'revision_required', 'approved', 'rejected') NOT NULL,
  changed_by BIGINT UNSIGNED NULL,
  note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_proposal_history_proposal (proposal_id, created_at),
  CONSTRAINT fk_proposal_history_proposal
    FOREIGN KEY (proposal_id) REFERENCES proposals (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_proposal_history_changed_by
    FOREIGN KEY (changed_by) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO users
  (id, university_id, email, first_name, last_name, role, department)
VALUES
  (1, 'FAC-0001', 'quey.baldos@g.batstate-u.edu.ph', 'Quey Jinnet', 'Baldos', 'faculty', 'College of Informatics and Computing Sciences'),
  (2, 'RHD-0001', 'mary.baldos@g.batstate-u.edu.ph', 'Mary Jhezl', 'Baldos', 'research_head', 'Research Office'),
  (3, 'FAC-0002', 'andrea.santos@g.batstate-u.edu.ph', 'Andrea', 'Santos', 'faculty', 'College of Engineering'),
  (4, 'FAC-0003', 'miguel.reyes@g.batstate-u.edu.ph', 'Miguel', 'Reyes', 'faculty', 'College of Arts and Sciences')
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  role = VALUES(role),
  department = VALUES(department),
  is_active = TRUE;

INSERT INTO announcements
  (id, category, title, body, status, is_featured, published_at, created_by)
VALUES
  (1, 'INSTITUTIONAL NOTICE', 'Research Ethics Review', 'Review the newly updated BatStateU institutional research ethics guidelines.', 'published', TRUE, NOW(), 2),
  (2, 'RESEARCH CALL', 'Faculty Research Grant', 'The next proposal cycle is now open for faculty-led research projects.', 'published', FALSE, NOW(), 2),
  (3, 'CAMPUS UPDATE', 'Research Week 2026', 'Presentation and poster-session registrations are now available.', 'published', FALSE, NOW(), 2)
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  title = VALUES(title),
  body = VALUES(body),
  status = VALUES(status),
  is_featured = VALUES(is_featured);

INSERT INTO proposals
  (id, reference_no, faculty_id, title, abstract_text, keywords, study_type, department, status, submitted_at)
VALUES
  (1, 'ATH-2026-0001', 3, 'Smart Campus Energy Monitoring Using Edge Sensors', 'A study on real-time energy monitoring and evidence-based conservation strategies for campus facilities.', JSON_ARRAY('energy', 'IoT', 'smart campus'), 'Institutional Research', 'College of Engineering', 'submitted', NOW()),
  (2, 'ATH-2026-0002', 4, 'Community Disaster Preparedness and Digital Information Access', 'An assessment of community access to verified digital information during severe weather and disaster events.', JSON_ARRAY('disaster preparedness', 'digital access'), 'Community-Based Research', 'College of Arts and Sciences', 'under_evaluation', NOW())
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  abstract_text = VALUES(abstract_text),
  status = VALUES(status),
  department = VALUES(department);

INSERT INTO proposal_status_history
  (proposal_id, from_status, to_status, changed_by, note)
SELECT p.id, NULL, p.status, p.faculty_id, 'Initial demo submission.'
FROM proposals p
WHERE p.id IN (1, 2)
  AND NOT EXISTS (
    SELECT 1 FROM proposal_status_history h WHERE h.proposal_id = p.id
  );
