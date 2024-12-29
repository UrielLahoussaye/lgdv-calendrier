import FormEvents from './FormEvents';
import styles from './FormEvents.module.css';

function AddEvent({ user }) {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>Ajouter un événement</h1>
        <FormEvents user={user} />
      </div>
    </div>
  );
}

export default AddEvent;
