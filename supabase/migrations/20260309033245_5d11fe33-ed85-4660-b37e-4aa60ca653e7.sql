
-- Global marketplace: players list items for sale
CREATE TABLE public.trade_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  item_type text NOT NULL, -- 'unit', 'artifact', 'spell', 'gold'
  item_id text NOT NULL, -- unit_name, artifact_id, spell_id, or 'gold'
  item_count integer NOT NULL DEFAULT 1,
  price integer NOT NULL DEFAULT 0, -- gold price
  status text NOT NULL DEFAULT 'active', -- 'active', 'sold', 'cancelled'
  buyer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);

CREATE INDEX idx_trade_offers_status ON public.trade_offers(status);
CREATE INDEX idx_trade_offers_seller ON public.trade_offers(seller_id);

ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;

-- Everyone can see active offers
CREATE POLICY "Anyone can view trade offers"
ON public.trade_offers FOR SELECT
TO authenticated
USING (true);

-- Sellers can create offers
CREATE POLICY "Users can create trade offers"
ON public.trade_offers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update own offers (cancel), buyers can update (buy)
CREATE POLICY "Users can update trade offers"
ON public.trade_offers FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id OR status = 'active');

-- Sellers can delete own offers
CREATE POLICY "Users can delete own trade offers"
ON public.trade_offers FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- Direct trade requests between nearby players
CREATE TABLE public.trade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  sender_offer jsonb NOT NULL DEFAULT '{}', -- {units: [{name, count}], artifacts: [id], spells: [id], gold: 0}
  receiver_offer jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_trade_requests_status ON public.trade_requests(status);

ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;

-- Both parties can view
CREATE POLICY "Users can view their trade requests"
ON public.trade_requests FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Senders can create
CREATE POLICY "Users can create trade requests"
ON public.trade_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Both parties can update (accept/reject/counter)
CREATE POLICY "Users can update their trade requests"
ON public.trade_requests FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Senders can delete
CREATE POLICY "Users can delete own trade requests"
ON public.trade_requests FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

-- Enable realtime for trade notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_requests;
