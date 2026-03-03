INSERT INTO admin_settings (setting_key, setting_value, description) 
VALUES ('nearby_requires_premium', '{"enabled": true}'::jsonb, 'Yêu cầu Premium cho tính năng Quanh đây')
ON CONFLICT DO NOTHING;