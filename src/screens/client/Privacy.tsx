import { Callout } from '../../components/primitives'
import styles from './Privacy.module.css'

export default function Privacy() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Privacy settings</h1>
      </div>

      <div className={styles.section}>
        <Callout v="ink" icon="ℹ">
          Your data is never sold or shared with third parties. shub is a directory platform — your
          personal details are only visible to people you transact with.
        </Callout>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Your data</p>
        <div className={styles.sectionCard}>
          <div className={styles.row}>
            <div>
              <p className={styles.rowLabel}>Profile visibility</p>
              <p className={styles.rowDesc}>Clients — your profile is not publicly listed. Companions — your listing is public once approved.</p>
            </div>
          </div>
          <div className={styles.row}>
            <div>
              <p className={styles.rowLabel}>Message history</p>
              <p className={styles.rowDesc}>Conversations are private between participants only.</p>
            </div>
          </div>
          <div className={styles.row}>
            <div>
              <p className={styles.rowLabel}>Booking history</p>
              <p className={styles.rowDesc}>Arrangement details are visible only to you and your companion.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Account</p>
        <div className={styles.sectionCard}>
          <div className={styles.row}>
            <div>
              <p className={styles.rowLabel}>Delete account</p>
              <p className={styles.rowDesc}>To request account deletion, email privacy@shub.nz</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
