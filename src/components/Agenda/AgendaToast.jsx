import "./AgendaToast.css";

export default function AgendaToast({ toast, onDismiss }) {
  if (!toast) {
    return null;
  }

  const tone = toast.type === "reminder" ? "agenda-toast--reminder" : "";
  const handleClick = () => {
    if (typeof onDismiss === "function") {
      onDismiss();
    }
  };

  return (
    <div className={`agenda-toast ${tone}`} onClick={handleClick}>
      <span className="agenda-toast__icon">🔔</span>
      <span>{toast.text}</span>
    </div>
  );
}
