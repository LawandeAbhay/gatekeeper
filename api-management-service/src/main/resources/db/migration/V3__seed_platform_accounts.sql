INSERT INTO management_users (
    organization_id,
    role_id,
    username,
    password_hash,
    enabled,
    created_at,
    updated_at
)
SELECT
    NULL,
    id,
    'platform_admin',
    'hashed-password',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM roles
WHERE name = 'PLATFORM_ADMIN';


INSERT INTO management_users (
    organization_id,
    role_id,
    username,
    password_hash,
    enabled,
    created_at,
    updated_at
)
SELECT
    NULL,
    id,
    'gateway_service',
    'hashed-password',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM roles
WHERE name = 'GATEWAY_SERVICE';