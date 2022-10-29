import "./Button.css";

export function Button({ onClick }) {

    return (
        <div className="button" onClick={onClick}>send data</div>
    );
}