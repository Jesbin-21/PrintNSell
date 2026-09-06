import "./Button.css";

function Button({
  text,
  icon,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variant} ${disabled ? "disabled" : ""}`}
    >
      {icon}
      {text && <span>{text}</span>}
    </button>
  );
}

export default Button;