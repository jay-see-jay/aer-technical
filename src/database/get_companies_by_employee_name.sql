SELECT
    company.*,
    employee.first_name AS employee_first_name,
    employee.last_name AS employee_last_name,
    employee.email AS employee_email,
    employee.role AS employee_role
FROM (
    SELECT
        *,
        (first_name || ' ' || last_name) AS employee_name
    FROM
        employee
    WHERE
        employee_name LIKE ?
) employee
INNER JOIN
    company ON company.id = employee.company_id
{filter}
ORDER BY company.id ASC
LIMIT ?
OFFSET ?;

