-- Insert default chat_filter_enabled setting
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES (
  'chat_filter_enabled',
  '{"enabled": true}'::jsonb,
  'Bật/tắt giới hạn tin nhắn cho người dùng Free (chỉ hiển thị 5 cuộc hội thoại đầu tiên)'
)
ON CONFLICT (setting_key) DO NOTHING;