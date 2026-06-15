-- Allow a user to delete their own profile row (used before deleting the auth user)
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);