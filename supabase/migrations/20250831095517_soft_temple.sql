/*
  # Create sample AI evaluation data

  1. Purpose
    - Add sample evaluation data to demonstrate the interview results functionality
    - Populate hrta_sd00-03_ai_evaluations table with realistic test data

  2. Data Structure
    - Creates evaluations for multiple candidates
    - Includes 10 questions per candidate (answer_index 1-10)
    - Provides realistic scoring across all evaluation criteria
    - Includes detailed AI textual evaluations

  3. Scoring Criteria
    - Technical Evaluation: 0-2.5 points
    - Clarity & Structure: 0-2.5 points  
    - Confidence & Experience: 0-2.5 points
    - Relevance: 0-2.5 points
    - Total Score: Sum of all four categories (0-10 points)
*/

-- Insert sample evaluation data for the first few candidates
INSERT INTO "hrta_sd00-03_ai_evaluations" (
  candidate_id,
  answer_index,
  technical_eval,
  clarity_structure,
  confidence_exp,
  relevance,
  total_score,
  ai_textual_eval
) VALUES
-- Candidate 1 - Excellent performer
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '1', 2.3, 2.4, 2.2, 2.1, 9.0, 'Excellent technical understanding demonstrated. The candidate provided a comprehensive solution with clear explanation of algorithms and data structures. Shows strong problem-solving skills and attention to detail.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '2', 2.2, 2.3, 2.1, 2.4, 9.0, 'Outstanding communication skills. The answer was well-structured, logical, and easy to follow. Demonstrated excellent understanding of software engineering principles.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '3', 2.4, 2.2, 2.3, 2.1, 9.0, 'Strong technical depth with practical examples. The candidate showed real-world experience and ability to apply theoretical knowledge to solve complex problems.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '4', 2.1, 2.4, 2.2, 2.3, 9.0, 'Impressive problem-solving approach. Methodical thinking process with clear reasoning. Shows potential for senior-level responsibilities.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '5', 2.3, 2.1, 2.4, 2.2, 9.0, 'Excellent grasp of modern development practices. Demonstrated knowledge of best practices, testing methodologies, and code quality standards.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '6', 2.2, 2.3, 2.1, 2.4, 9.0, 'Strong analytical skills with attention to edge cases. The candidate considered multiple scenarios and provided robust solutions.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '7', 2.4, 2.2, 2.3, 2.1, 9.0, 'Excellent communication of complex technical concepts. Able to explain difficult topics in an accessible manner.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '8', 2.1, 2.4, 2.2, 2.3, 9.0, 'Demonstrated strong leadership potential and team collaboration skills. Shows understanding of agile methodologies.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '9', 2.3, 2.1, 2.4, 2.2, 9.0, 'Outstanding performance optimization knowledge. Showed deep understanding of system architecture and scalability concerns.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 0), '10', 2.2, 2.3, 2.1, 2.4, 9.0, 'Excellent overall performance. Candidate demonstrated comprehensive knowledge and strong potential for success in the role.'),

-- Candidate 2 - Good performer
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '1', 1.8, 1.9, 1.7, 1.8, 7.2, 'Good technical foundation with room for improvement. The candidate showed solid understanding but could benefit from more practical experience.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '2', 1.9, 1.8, 1.8, 1.7, 7.2, 'Clear communication with minor gaps in explanation. Overall good structure but some concepts could be explained more thoroughly.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '3', 1.7, 1.8, 1.9, 1.8, 7.2, 'Adequate technical knowledge with some practical examples. Shows potential but needs more experience with complex systems.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '4', 1.8, 1.7, 1.8, 1.9, 7.2, 'Good problem-solving approach but could be more systematic. Shows logical thinking with room for improvement in methodology.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '5', 1.9, 1.8, 1.7, 1.8, 7.2, 'Solid understanding of development practices. Good foundation but could demonstrate more advanced concepts and patterns.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '6', 1.8, 1.9, 1.8, 1.7, 7.2, 'Good analytical skills with basic edge case consideration. Shows promise but needs more comprehensive thinking.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '7', 1.7, 1.8, 1.9, 1.8, 7.2, 'Adequate communication skills. Can explain concepts but sometimes lacks clarity in complex technical discussions.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '8', 1.8, 1.7, 1.8, 1.9, 7.2, 'Shows some leadership awareness but limited experience. Good potential for growth in team environments.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '9', 1.9, 1.8, 1.7, 1.8, 7.2, 'Basic performance optimization knowledge. Understands concepts but lacks deep practical experience.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 1), '10', 1.8, 1.9, 1.8, 1.7, 7.2, 'Overall good performance with consistent results. Solid candidate with potential for growth and development.'),

-- Candidate 3 - Satisfactory performer
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '1', 1.5, 1.6, 1.4, 1.5, 6.0, 'Basic technical understanding with significant gaps. The candidate shows potential but needs substantial development in core concepts.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '2', 1.6, 1.5, 1.5, 1.4, 6.0, 'Communication needs improvement. Ideas are present but presentation lacks clarity and organization.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '3', 1.4, 1.5, 1.6, 1.5, 6.0, 'Limited technical depth but shows willingness to learn. Would benefit from mentoring and structured learning program.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '4', 1.5, 1.4, 1.5, 1.6, 6.0, 'Basic problem-solving skills with inconsistent approach. Shows some logical thinking but lacks systematic methodology.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '5', 1.6, 1.5, 1.4, 1.5, 6.0, 'Minimal understanding of development practices. Basic knowledge present but needs significant improvement.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '6', 1.5, 1.6, 1.5, 1.4, 6.0, 'Limited analytical skills. Basic understanding but struggles with complex scenarios and edge cases.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '7', 1.4, 1.5, 1.6, 1.5, 6.0, 'Communication skills need development. Has ideas but struggles to articulate them clearly and concisely.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '8', 1.5, 1.4, 1.5, 1.6, 6.0, 'Limited leadership experience. Shows some awareness but needs significant development in team dynamics.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '9', 1.6, 1.5, 1.4, 1.5, 6.0, 'Basic performance concepts understood. Limited practical experience with optimization and system design.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 2), '10', 1.5, 1.6, 1.5, 1.4, 6.0, 'Consistent but basic performance throughout. Shows potential but requires significant training and development.'),

-- Candidate 4 - Poor performer
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '1', 1.2, 1.1, 1.0, 1.2, 4.5, 'Significant technical gaps identified. The candidate struggles with fundamental concepts and shows limited understanding of core principles.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '2', 1.1, 1.2, 1.1, 1.1, 4.5, 'Poor communication and unclear explanations. Difficulty articulating thoughts and organizing responses coherently.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '3', 1.0, 1.1, 1.2, 1.2, 4.5, 'Minimal technical knowledge demonstrated. Lacks practical experience and theoretical understanding of key concepts.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '4', 1.2, 1.0, 1.1, 1.2, 4.5, 'Weak problem-solving skills. Struggles to approach problems systematically and lacks logical reasoning.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '5', 1.1, 1.2, 1.0, 1.2, 4.5, 'Limited understanding of development practices. Basic concepts are unclear and implementation knowledge is insufficient.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '6', 1.2, 1.1, 1.2, 1.0, 4.5, 'Poor analytical thinking. Difficulty identifying key issues and considering important factors in problem-solving.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '7', 1.0, 1.2, 1.1, 1.2, 4.5, 'Communication skills significantly below expectations. Struggles to convey ideas effectively and clearly.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '8', 1.1, 1.0, 1.2, 1.2, 4.5, 'No demonstrated leadership experience or potential. Limited understanding of team dynamics and collaboration.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '9', 1.2, 1.1, 1.0, 1.2, 4.5, 'Minimal performance optimization knowledge. Lacks understanding of system efficiency and scalability principles.'),
((SELECT candidate_id FROM "hrta_cd00-01_resume_extraction" LIMIT 1 OFFSET 3), '10', 1.1, 1.2, 1.1, 1.1, 4.5, 'Overall performance below standards. Candidate requires extensive training and may not be suitable for the current role.');