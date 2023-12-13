SELECT
    company.*,
    employee.first_name AS employee_first_name,
    employee.last_name AS employee_last_name,
    employee.email AS employee_email,
    employee.role AS employee_role
FROM (
    SELECT
        *
    FROM
        company
    {filter}
    ORDER BY id ASC
    LIMIT ?
    OFFSET ?
) company
LEFT JOIN
    employee ON company.id = employee.company_id;
