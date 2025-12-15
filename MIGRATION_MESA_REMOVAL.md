# Migration: Remove Customer Mesa Selection

## Overview

This migration removes the customer-facing table (mesa) selection feature from the reservations system. Customers will no longer select tables during the reservation process - the restaurant will assign tables manually after payment confirmation.

## Changes Made

### 1. Frontend Changes

#### ReservaForm.tsx (`app/components/ReservaForm.tsx`)
- ❌ Removed import of `MapaMesas` component
- ❌ Removed import of `TableArea`, `AREA_NAMES`, `AREA_DESCRIPTIONS` from `lib/tables-config`
- ❌ Removed `selectedTables` state
- ❌ Removed `selectedArea` state
- ❌ Removed `handleMesasSelect` function
- ❌ Removed entire "Seleção de Área" section (area selection buttons)
- ❌ Removed entire "Mapa de Mesas" component section
- ❌ Removed mesa validation logic from `onSubmit` function
- ❌ Removed `mesasSelecionadas` from API request body

#### MapaMesas.tsx
- 🗑️ **DELETED** - Entire component removed (no longer needed)

### 2. Backend Changes

#### API Routes

##### `app/api/create-payment/route.ts`
- ❌ Removed `mesasSelecionadas` from destructured request data
- ❌ Removed `mesasSelecionadas` from Prisma reservation creation
- ✅ Reservation creation now only handles: nome, email, telefone, data, horario, numeroPessoas, valor, status

##### `app/api/get-available-tables/route.ts`
- 🗑️ **DELETED** - Endpoint no longer needed as customers don't select tables

### 3. Database Changes

#### Prisma Schema (`prisma/schema.prisma`)

**Before:**
```prisma
model Reservation {
  // ... other fields
  mesasSelecionadas String?
  observacoes       String?
}
```

**After:**
```prisma
model Reservation {
  // ... other fields
  mesaAtribuida     String?
  observacoes       String?
}
```

#### Database Migration

A migration file has been created at:
`prisma/migrations/remove_mesa_selection/migration.sql`

**SQL Operations:**
```sql
-- Remove old customer-selected mesas column
ALTER TABLE "Reservation" DROP COLUMN IF EXISTS "mesasSelecionadas";

-- Add new staff-assigned mesas column
ALTER TABLE "Reservation" ADD COLUMN "mesaAtribuida" TEXT;

-- Create index for faster queries
CREATE INDEX "Reservation_mesaAtribuida_idx" ON "Reservation"("mesaAtribuida");
```

## How to Apply Changes

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Run Database Migration
```bash
npx prisma migrate deploy
```

If you haven't applied migrations yet, you can also run:
```bash
npx prisma db push
```

### Step 3: Verify Changes
```bash
# Check that the Prisma client is up to date
npx prisma generate

# Optionally, validate the schema
npx prisma validate
```

## Manual SQL Execution (If Needed)

If using direct SQL without Prisma migrations, execute:

```sql
-- PostgreSQL Example
ALTER TABLE "Reservation" DROP COLUMN IF EXISTS "mesasSelecionadas";
ALTER TABLE "Reservation" ADD COLUMN "mesaAtribuida" VARCHAR(255);
CREATE INDEX "Reservation_mesaAtribuida_idx" ON "Reservation"("mesaAtribuida");
```

## New Workflow

### Customer Reservation Flow (Before)
1. ✅ Fill personal info
2. ✅ Select date and time
3. ❌ **Select tables** (REMOVED)
4. ✅ Complete payment
5. Admin assigns table later

### Customer Reservation Flow (After)
1. ✅ Fill personal info
2. ✅ Select date and time
3. ✅ Complete payment
4. Admin assigns table after confirmation

## Next Steps for Full Implementation

### For Admin Dashboard

The admin dashboard should be updated to support table assignment:

1. **List reservations pending table assignment**
   ```typescript
   // Example query
   const pendingReservations = await prisma.reservation.findMany({
     where: {
       status: 'confirmed',
       mesaAtribuida: null
     }
   });
   ```

2. **Update reservation with assigned table**
   ```typescript
   // Example mutation
   await prisma.reservation.update({
     where: { id: reservationId },
     data: { mesaAtribuida: mesaNumber }
   });
   ```

3. **View assigned tables**
   - Show which tables are assigned to which reservations
   - Show occupancy by date and time

### Frontend Considerations

- Remove any references to `MapaMesas` in other components
- Clean up unused imports from `lib/tables-config`
- Update any documentation or user guides
- Consider adding UI for staff to assign tables in admin panel

### Validation Notes

⚠️ The `mesaAtribuida` field is optional (`String?`), meaning:
- Newly created reservations will have `mesaAtribuida = null`
- Staff must manually assign tables after payment
- Only confirmed reservations should have assigned mesas

## Files Modified

- ✅ `prisma/schema.prisma` - Updated Reservation model
- ✅ `app/components/ReservaForm.tsx` - Removed mesa selection UI
- ✅ `app/api/create-payment/route.ts` - Removed mesa handling
- 🗑️ `app/components/MapaMesas.tsx` - DELETED
- 🗑️ `app/api/get-available-tables/route.ts` - DELETED
- ✨ `prisma/migrations/remove_mesa_selection/migration.sql` - NEW

## Rollback

If needed to rollback (not recommended), you would need to:
1. Restore the deleted files from git history
2. Create a reverse migration to add the column back
3. Restore the Prisma schema

```bash
# Revert last migration
npx prisma migrate resolve --rolled-back remove_mesa_selection
```

## Testing Checklist

- [ ] Database migration executes without errors
- [ ] Prisma client generated successfully
- [ ] Frontend form submits without validation errors
- [ ] Payment API receives and processes data correctly
- [ ] New reservations are created in the database without `mesasSelecionadas`
- [ ] Admin can view reservations with null `mesaAtribuida`
- [ ] No console errors about missing components or undefined imports

## Support

For questions or issues:
1. Check the Prisma migration status: `npx prisma migrate status`
2. Validate schema: `npx prisma validate`
3. Check database directly for the new column
