-- Create function to like fake user
CREATE OR REPLACE FUNCTION public.like_fake_user(
  liker_id_param text,
  liked_id_param text,
  liker_type_param text,
  liked_type_param text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  existing_like_id uuid;
  is_matched boolean := false;
BEGIN
  -- Check if like already exists
  SELECT id INTO existing_like_id 
  FROM user_likes 
  WHERE liker_id = liker_id_param AND liked_id = liked_id_param;
  
  -- If like doesn't exist, create it
  IF existing_like_id IS NULL THEN
    INSERT INTO user_likes (liker_id, liked_id)
    VALUES (liker_id_param, liked_id_param);
    
    -- Check if it's a match (fake user likes back)
    IF liked_type_param = 'fake' THEN
      -- Auto-like back from fake user (80% chance)
      IF random() > 0.2 THEN
        INSERT INTO user_likes (liker_id, liked_id)
        VALUES (liked_id_param, liker_id_param)
        ON CONFLICT (liker_id, liked_id) DO NOTHING;
        is_matched := true;
      END IF;
    END IF;
  END IF;
  
  RETURN is_matched;
END;
$$;

-- Create function to like fake post
CREATE OR REPLACE FUNCTION public.like_fake_post(
  post_id_param uuid,
  user_id_param text
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or ignore if already exists
  INSERT INTO post_likes (post_id, user_id)
  VALUES (post_id_param, user_id_param)
  ON CONFLICT (post_id, user_id) DO NOTHING;
END;
$$;

-- Create function to comment on fake post
CREATE OR REPLACE FUNCTION public.comment_on_fake_post(
  post_id_param uuid,
  user_id_param text,
  content_param text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_comment_id uuid;
BEGIN
  INSERT INTO comments (post_id, user_id, content)
  VALUES (post_id_param, user_id_param, content_param)
  RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$;

-- Create function to send friend request to fake user
CREATE OR REPLACE FUNCTION public.send_friend_request_to_fake_user(
  real_user_id uuid,
  fake_user_id text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_request_id uuid;
BEGIN
  -- Insert friend request
  INSERT INTO friends (user_id, friend_id, status)
  VALUES (real_user_id, fake_user_id::uuid, 'pending')
  ON CONFLICT (user_id, friend_id) DO NOTHING
  RETURNING id INTO new_request_id;
  
  -- Auto-accept from fake user (90% chance)
  IF random() > 0.1 AND new_request_id IS NOT NULL THEN
    UPDATE friends 
    SET status = 'accepted', accepted_at = now()
    WHERE id = new_request_id;
  END IF;
  
  RETURN new_request_id;
END;
$$;

-- Create function to create conversation with fake user
CREATE OR REPLACE FUNCTION public.create_conversation_with_fake_user(
  real_user_id uuid,
  fake_user_id text
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  conversation_id uuid;
BEGIN
  -- Check if conversation already exists
  SELECT id INTO conversation_id
  FROM conversations
  WHERE user_real_id = real_user_id AND user_fake_id = fake_user_id;
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (user_real_id, user_fake_id)
    VALUES (real_user_id, fake_user_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;