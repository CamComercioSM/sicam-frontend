// resources/js/utils/fechas.js
window.formatDate = function (fecha) {
  const date = new Date(fecha);
  if (isNaN(date)) throw new Error("Fecha inválida");

  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const año = date.getFullYear();

  return `${dia}/${mes}/${año}`;
};
