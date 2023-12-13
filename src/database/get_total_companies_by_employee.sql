SELECT
    MIN(id) AS first,
    MAX(id) AS last,
    COUNT(id) AS count
FROM company
WHERE id IN (
    SELECT
        DISTINCT(company_id)
    FROM
        employee
    WHERE
        (first_name || ' ' || last_name) LIKE ?
)
{filter}
