/**
 * Entity representing a currency.
 */
export interface CurrencyEntity {
  /** Currency name (e.g., United States Dollar). */
  currency: string;
  /** Unique ID for the currency. */
  supported_currency_id: string;
  /** Whether the currency is active. */
  is_active: boolean;
  /** Conversion rate to XAF. */
  xaf_rate: number;
  /** Timestamp when the currency was last updated. */
  last_updated: string;
  /** Timestamp when the currency was created. */
  created_at: string;
  /** User or system responsible for creating the currency. */
  created_by: string;
}
