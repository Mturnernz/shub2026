import { useNavigate } from 'react-router-dom'
import { Sheet, Btn } from '../primitives'
import { useUIStore } from '../../store/ui.store'
import type { ProviderListing } from '../../types'
import styles from './ConnectSheet.module.css'

export interface ConnectSheetProps {
  providerId: string | null
  open: boolean
  onClose: () => void
  listing: ProviderListing | null
  onViewProfile: () => void
}

export default function ConnectSheet({ providerId, open, onClose, listing, onViewProfile }: ConnectSheetProps) {
  const navigate = useNavigate()
  const { showToast } = useUIStore()

  const showInPerson = !listing || listing.type === 'inperson' || listing.type === 'both'
  const showOnline = listing?.type === 'online' || listing?.type === 'both'

  function goBook() {
    onClose()
    navigate(`/book/${providerId}`)
  }

  function goOnline() {
    onClose()
    showToast('Online services — coming soon.')
  }

  function goShop() {
    onClose()
    showToast('Shop — coming soon.')
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>How would you like to connect?</h2>

        <div className={styles.paths}>
          {showInPerson && (
            <button className={[styles.pathCard, styles.rose].join(' ')} onClick={goBook}>
              <span className={styles.pathIcon}>◆</span>
              <div className={styles.pathText}>
                <span className={styles.pathTitle}>In-person arrangement</span>
                <span className={styles.pathSub}>
                  {listing?.price_social ? `from $${listing.price_social} / hr` : 'Request an arrangement'}
                </span>
              </div>
              <span className={styles.pathArrow}>→</span>
            </button>
          )}

          {showOnline && (
            <button className={[styles.pathCard, styles.teal].join(' ')} onClick={goOnline}>
              <span className={styles.pathIcon}>✦</span>
              <div className={styles.pathText}>
                <span className={styles.pathTitle}>Online services</span>
                <span className={styles.pathSub}>
                  {listing?.price_online_from ? `from $${listing.price_online_from}` : 'Subscriptions & content'}
                </span>
              </div>
              <span className={styles.pathArrow}>→</span>
            </button>
          )}

          <button className={[styles.pathCard, styles.gold].join(' ')} onClick={goShop}>
            <span className={styles.pathIcon}>★</span>
            <div className={styles.pathText}>
              <span className={styles.pathTitle}>Shop</span>
              <span className={styles.pathSub}>Browse their shop items</span>
            </div>
            <span className={styles.pathArrow}>→</span>
          </button>
        </div>

        <div className={styles.footer}>
          <Btn v="ghost" full onClick={() => { onClose(); onViewProfile() }}>
            View full profile
          </Btn>
        </div>
      </div>
    </Sheet>
  )
}
