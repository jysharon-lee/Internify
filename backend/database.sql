-- INTERNIFY DATABASE INITIALIZATION

-- Drop existing database (careful in production!)
DROP DATABASE IF EXISTS internify;

-- Create database
CREATE DATABASE internify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internify;

-- TABLE: skills
CREATE TABLE skills (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(80)  NOT NULL UNIQUE,
    category    ENUM('technical','soft','language','tool','other') NOT NULL DEFAULT 'technical',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- TABLE: users
CREATE TABLE users (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email               VARCHAR(191) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    full_name           VARCHAR(120) NOT NULL,
    avatar_url          VARCHAR(512),

    headline            VARCHAR(200),
    bio                 TEXT,
    location            VARCHAR(100),
    phone               VARCHAR(30),

    years_experience    TINYINT UNSIGNED DEFAULT 0,
    preferred_role      VARCHAR(100),
    preferred_location  VARCHAR(100),
    preferred_type      ENUM('full-time','part-time','remote','hybrid','any') DEFAULT 'any',
    expected_salary     INT UNSIGNED,

    resume_url          VARCHAR(512),
    resume_parsed_text  TEXT,

    onboarding_step     TINYINT UNSIGNED DEFAULT 0,
    onboarding_complete TINYINT(1) DEFAULT 0,

    is_active           TINYINT(1) DEFAULT 1,
    last_login          TIMESTAMP NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_preferred_type (preferred_type)
);

-- TABLE: user_skills
CREATE TABLE user_skills (
    user_id         INT UNSIGNED NOT NULL,
    skill_id        INT UNSIGNED NOT NULL,
    proficiency     ENUM('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
    years_used      TINYINT UNSIGNED DEFAULT 0,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- TABLE: companies
CREATE TABLE companies (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    logo_url    VARCHAR(512),
    website     VARCHAR(255),
    industry    VARCHAR(100),
    size        ENUM('startup','small','medium','large','enterprise') DEFAULT 'medium',
    description TEXT,
    location    VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: internships
CREATE TABLE internships (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id          INT UNSIGNED NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    responsibilities    TEXT,
    requirements        TEXT,

    location            VARCHAR(100),
    work_type           ENUM('full-time','part-time','remote','hybrid') NOT NULL DEFAULT 'full-time',
    min_experience      TINYINT UNSIGNED DEFAULT 0,
    stipend_min         INT UNSIGNED,
    stipend_max         INT UNSIGNED,
    duration_months     TINYINT UNSIGNED DEFAULT 3,

    application_deadline DATE,
    posted_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active           TINYINT(1) DEFAULT 1,
    slots               TINYINT UNSIGNED DEFAULT 1,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_active        (is_active),
    INDEX idx_work_type     (work_type),
    INDEX idx_deadline      (application_deadline),
    INDEX idx_posted        (posted_at DESC)
);

-- TABLE: internship_skills

CREATE TABLE internship_skills (
    internship_id   INT UNSIGNED NOT NULL,
    skill_id        INT UNSIGNED NOT NULL,
    is_required     TINYINT(1) DEFAULT 1,
    PRIMARY KEY (internship_id, skill_id),
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id)      REFERENCES skills(id)      ON DELETE CASCADE
);
-- TABLE: applications
CREATE TABLE applications (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    internship_id   INT UNSIGNED NOT NULL,
    stage           ENUM('saved','applied','interview','offer','rejected') NOT NULL DEFAULT 'saved',

    match_score     TINYINT UNSIGNED,
    applied_at      TIMESTAMP NULL,
    notes           TEXT,
    cover_letter    TEXT,
    interview_date  DATE NULL,
    offer_amount    INT UNSIGNED NULL,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_user_internship (user_id, internship_id),
    FOREIGN KEY (user_id)       REFERENCES users(id)        ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id)  ON DELETE CASCADE,
    INDEX idx_user_stage   (user_id, stage),
    INDEX idx_applied_at   (applied_at)
);

-- TABLE: notifications
CREATE TABLE notifications (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    type        ENUM('new_match','deadline','status_change','system') NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT,
    is_read     TINYINT(1) DEFAULT 0,
    link        VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created     (created_at DESC)
);

-- SEED DATA

-- Skills master list
INSERT INTO skills (name, category) VALUES
('JavaScript',    'technical'), ('TypeScript',    'technical'),
('Vue.js',        'technical'), ('React',         'technical'),
('Node.js',       'technical'), ('Python',        'technical'),
('Java',          'technical'), ('SQL',           'technical'),
('MySQL',         'technical'), ('PostgreSQL',    'technical'),
('MongoDB',       'technical'), ('Redis',         'technical'),
('Docker',        'tool'),      ('Git',           'tool'),
('Figma',         'tool'),      ('Postman',       'tool'),
('REST API',      'technical'), ('GraphQL',       'technical'),
('AWS',           'technical'), ('Linux',         'tool'),
('Communication', 'soft'),      ('Teamwork',      'soft'),
('Problem Solving','soft'),     ('Leadership',    'soft'),
('Mandarin',      'language'),  ('Malay',         'language'),
('English',       'language'),  ('Express.js',   'technical'),
('CSS',           'technical'), ('HTML',          'technical');

-- Companies
INSERT INTO companies (name, logo_url, website, industry, size, location, description) VALUES
('Grab','https://logo.clearbit.com/grab.com','https://grab.com','Technology','enterprise','Kuala Lumpur','Southeast Asia leading superapp'),
('Petronas Digital','https://logo.clearbit.com/petronas.com','https://petronas.com','Energy/Tech','large','Kuala Lumpur','Digital arm of Petronas'),
('Shopee','https://logo.clearbit.com/shopee.com','https://shopee.com','E-Commerce','enterprise','Kuala Lumpur','Leading e-commerce platform'),
('Axiata','https://logo.clearbit.com/axiata.com','https://axiata.com','Telecommunications','large','Kuala Lumpur','Telecoms & digital services'),
('CIMB Tech','https://logo.clearbit.com/cimb.com','https://cimb.com','Fintech','large','Kuala Lumpur','Banking technology division'),
('Fusionex','https://logo.clearbit.com/fusionex-international.com','https://fusionex.com','Data Analytics','medium','Kuala Lumpur','Big data analytics company'),
('AirAsia Digital','https://logo.clearbit.com/airasia.com','https://airasia.com','Travel/Tech','large','Sepang','Digital ventures of AirAsia'),
('Khazanah Digital','https://logo.clearbit.com/khazanah.com.my','https://khazanah.com.my','Investment/Tech','medium','Kuala Lumpur','Tech investments & ventures');

-- Internships
INSERT INTO internships (company_id, title, description, responsibilities, requirements, location, work_type, min_experience, stipend_min, stipend_max, duration_months, application_deadline, slots) VALUES
(1, 'Frontend Engineer Intern',
 'Join Grabs consumer app team and build features used by millions across SEA.',
 'Build responsive UI components using Vue/React, collaborate with design team, write unit tests, participate in code reviews.',
 'Pursuing CS or related degree, strong JavaScript fundamentals, experience with any modern JS framework.',
 'Kuala Lumpur', 'hybrid', 0, 2000, 3000, 3, '2025-08-31', 3),

(1, 'Backend Engineer Intern',
 'Work on Grabs high-scale microservices handling millions of daily transactions.',
 'Design and implement REST APIs, optimize database queries, write integration tests, participate in system design discussions.',
 'Pursuing CS degree, strong in Python or Node.js, basic understanding of databases and REST APIs.',
 'Kuala Lumpur', 'hybrid', 0, 2000, 3000, 3, '2025-08-31', 2),

(3, 'Data Analyst Intern',
 'Help Shopee make data-driven decisions across marketplace operations.',
 'Analyze large datasets, build dashboards, write SQL queries, present findings to stakeholders.',
 'Pursuing statistics, CS or related field, proficient in SQL and Python, experience with Tableau or Power BI is a plus.',
 'Kuala Lumpur', 'full-time', 0, 1800, 2500, 4, '2025-07-31', 2),

(2, 'Full Stack Developer Intern',
 'Build internal tools and digital solutions for Petronas operations.',
 'Develop full-stack features using React and Node.js, integrate with legacy systems, document APIs.',
 'JavaScript, React, Node.js, SQL. Familiarity with Docker is a plus.',
 'Kuala Lumpur', 'hybrid', 1, 2200, 3000, 6, '2025-09-15', 1),

(5, 'Fintech Software Intern',
 'Help build next-generation banking features at CIMBs technology division.',
 'Develop and test banking microservices, write unit and integration tests, assist in security audits.',
 'Java or Python, basic SQL, understanding of REST APIs, interest in fintech.',
 'Kuala Lumpur', 'full-time', 0, 1500, 2000, 3, '2025-07-15', 3),

(6, 'Big Data Engineering Intern',
 'Process and transform large-scale data pipelines at Fusionex.',
 'Build ETL pipelines, work with Spark and Hadoop, optimize data warehouse queries.',
 'Python, SQL, basic understanding of big data concepts. PySpark experience is a plus.',
 'Kuala Lumpur', 'full-time', 0, 1800, 2500, 3, '2025-08-01', 2),

(7, 'UI/UX Design Intern',
 'Design digital experiences for AirAsia super app and travel products.',
 'Create wireframes and prototypes, conduct user research, collaborate with engineering team.',
 'Proficiency in Figma, portfolio of design projects, understanding of user-centered design principles.',
 'Remote', 'remote', 0, 1500, 2000, 3, '2025-08-15', 2),

(4, 'DevOps Intern',
 'Support Axiatas cloud infrastructure and CI/CD pipelines.',
 'Maintain Kubernetes clusters, set up CI/CD pipelines, monitor system health, write automation scripts.',
 'Linux, Docker, Git, basic scripting (Bash/Python). AWS or GCP knowledge is a plus.',
 'Kuala Lumpur', 'hybrid', 0, 2000, 2800, 3, '2025-09-01', 1);

-- Internship skills mapping
-- Internship 1 (Frontend @ Grab): JS, Vue, React, CSS, HTML, Git
INSERT INTO internship_skills VALUES
(1,1,1),(1,3,1),(1,4,0),(1,29,1),(1,30,1),(1,14,1);
-- Internship 2 (Backend @ Grab): Node.js, Python, REST, SQL, Docker, Git
INSERT INTO internship_skills VALUES
(2,5,1),(2,6,0),(2,8,1),(2,17,1),(2,13,0),(2,14,1);
-- Internship 3 (Data Analyst @ Shopee): Python, SQL, MySQL
INSERT INTO internship_skills VALUES
(3,6,1),(3,8,1),(3,9,0),(3,23,0);
-- Internship 4 (Full Stack @ Petronas): JS, React, Node.js, SQL, Docker
INSERT INTO internship_skills VALUES
(4,1,1),(4,4,1),(4,5,1),(4,8,1),(4,13,0),(4,14,1);
-- Internship 5 (Fintech @ CIMB): Java, Python, SQL, REST
INSERT INTO internship_skills VALUES
(5,7,1),(5,6,0),(5,8,1),(5,17,1);
-- Internship 6 (Big Data @ Fusionex): Python, SQL
INSERT INTO internship_skills VALUES
(6,6,1),(6,8,1),(6,23,0);
-- Internship 7 (UI/UX @ AirAsia): Figma
INSERT INTO internship_skills VALUES
(7,15,1),(7,21,0),(7,22,0);
-- Internship 8 (DevOps @ Axiata): Docker, Linux, Git, Python
INSERT INTO internship_skills VALUES
(8,13,1),(8,20,1),(8,14,1),(8,6,0);

-- Verify setup
SELECT 'Skills' AS table_name, COUNT(*) AS count FROM skills
UNION ALL
SELECT 'Companies', COUNT(*) FROM companies
UNION ALL
SELECT 'Internships', COUNT(*) FROM internships
UNION ALL
SELECT 'Internship Skills', COUNT(*) FROM internship_skills;

PRINT '\nDatabase schema and seed data loaded successfully!\n';