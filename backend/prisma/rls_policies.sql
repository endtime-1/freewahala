-- DirectRent Ghana Row Level Security Policies
-- Run this after creating tables via Prisma migration

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactUnlock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FraudReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RentalAgreement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceProvider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceBooking" ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USER POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON "User" FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON "User" FOR UPDATE
USING (auth.uid()::text = id);

-- =============================================
-- PROPERTY POLICIES
-- =============================================

-- Anyone can view verified properties (public listings)
CREATE POLICY "Anyone can view verified properties"
ON "Property" FOR SELECT
USING ("verificationStatus" = true);

-- Property owners can view all their properties
CREATE POLICY "Owners can view own properties"
ON "Property" FOR SELECT
USING (auth.uid()::text = "ownerId");

-- Only landlords can create properties
CREATE POLICY "Landlords can create properties"
ON "Property" FOR INSERT
WITH CHECK (
  auth.uid()::text = "ownerId"
  AND EXISTS (
    SELECT 1 FROM "User" WHERE id = auth.uid()::text AND "activeRole" = 'LANDLORD'
  )
);

-- Owners can update their own properties
CREATE POLICY "Owners can update own properties"
ON "Property" FOR UPDATE
USING (auth.uid()::text = "ownerId");

-- Owners can delete their own properties
CREATE POLICY "Owners can delete own properties"
ON "Property" FOR DELETE
USING (auth.uid()::text = "ownerId");

-- =============================================
-- CONTACT UNLOCK POLICIES
-- =============================================

-- Users can view their own unlocked contacts
CREATE POLICY "Users can view own unlocks"
ON "ContactUnlock" FOR SELECT
USING (auth.uid()::text = "userId");

-- Users can create unlock records (handled by API with business logic)
CREATE POLICY "Users can create unlocks"
ON "ContactUnlock" FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

-- =============================================
-- FAVORITE POLICIES
-- =============================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON "Favorite" FOR SELECT
USING (auth.uid()::text = "userId");

-- Users can add favorites
CREATE POLICY "Users can add favorites"
ON "Favorite" FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

-- Users can remove their own favorites
CREATE POLICY "Users can remove own favorites"
ON "Favorite" FOR DELETE
USING (auth.uid()::text = "userId");

-- =============================================
-- FRAUD REPORT POLICIES
-- =============================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON "FraudReport" FOR SELECT
USING (auth.uid()::text = "reporterId");

-- Anyone can create reports
CREATE POLICY "Users can create reports"
ON "FraudReport" FOR INSERT
WITH CHECK (auth.uid()::text = "reporterId");

-- =============================================
-- RENTAL AGREEMENT POLICIES
-- =============================================

-- Landlords and tenants can view agreements they're part of
CREATE POLICY "Parties can view agreements"
ON "RentalAgreement" FOR SELECT
USING (
  auth.uid()::text = "landlordId"
  OR auth.uid()::text = "tenantId"
);

-- Landlords can create agreements
CREATE POLICY "Landlords can create agreements"
ON "RentalAgreement" FOR INSERT
WITH CHECK (auth.uid()::text = "landlordId");

-- Parties can update agreements (for signing)
CREATE POLICY "Parties can update agreements"
ON "RentalAgreement" FOR UPDATE
USING (
  auth.uid()::text = "landlordId"
  OR auth.uid()::text = "tenantId"
);

-- =============================================
-- SERVICE PROVIDER POLICIES
-- =============================================

-- Anyone can view verified service providers
CREATE POLICY "Anyone can view verified providers"
ON "ServiceProvider" FOR SELECT
USING ("verified" = true);

-- Providers can view their own profile
CREATE POLICY "Providers can view own profile"
ON "ServiceProvider" FOR SELECT
USING (auth.uid()::text = "userId");

-- Users can register as providers
CREATE POLICY "Users can register as provider"
ON "ServiceProvider" FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

-- Providers can update own profile
CREATE POLICY "Providers can update own profile"
ON "ServiceProvider" FOR UPDATE
USING (auth.uid()::text = "userId");

-- =============================================
-- SERVICE BOOKING POLICIES
-- =============================================

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
ON "ServiceBooking" FOR SELECT
USING (auth.uid()::text = "customerId");

-- Providers can view bookings for them
CREATE POLICY "Providers can view their bookings"
ON "ServiceBooking" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "ServiceProvider" 
    WHERE id = "ServiceBooking"."providerId" 
    AND "userId" = auth.uid()::text
  )
);

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
ON "ServiceBooking" FOR INSERT
WITH CHECK (auth.uid()::text = "customerId");

-- Parties can update bookings
CREATE POLICY "Parties can update bookings"
ON "ServiceBooking" FOR UPDATE
USING (
  auth.uid()::text = "customerId"
  OR EXISTS (
    SELECT 1 FROM "ServiceProvider" 
    WHERE id = "ServiceBooking"."providerId" 
    AND "userId" = auth.uid()::text
  )
);

-- =============================================
-- ADMIN BYPASS (for service account)
-- =============================================

-- Admins can do anything (use service role key)
-- This is handled by using supabaseAdmin client in backend
