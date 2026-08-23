import { useState } from 'react';

export default function IngredientInput({ ingredients, onAdd, onRemove }) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      onAdd(trimmed.toLowerCase());
    }
    setValue('');
  }

  return (
    <div className="ingredient-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex: frango, tomate, arroz..."
          aria-label="Adicionar ingrediente"
        />
        <button type="submit">Adicionar</button>
      </form>

      {ingredients.length > 0 && (
        <ul className="ingredient-chips">
          {ingredients.map((item) => (
            <li key={item} className="chip">
              {item}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Remover ${item}`}
                onClick={() => onRemove(item)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
