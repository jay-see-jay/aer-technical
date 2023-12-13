SELECT
    MIN(id) AS first,
    MAX(id) AS last,
    COUNT(*) AS count
FROM
    company
{filter}
