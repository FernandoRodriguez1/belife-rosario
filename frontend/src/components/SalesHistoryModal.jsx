import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, Trash2, X } from "lucide-react";
import Button from "./Button";
import { formatCurrency } from "../utils/formatCurrency";
import { formatFecha } from "../utils/formatFecha";
import { labelFormaPago } from "../utils/formaPago";
import { esModoKilos, aKilos, GRAMOS_POR_KILO } from "../utils/unidadPrecio";
import ConfirmDialog from "./ConfirmDialog";
import { useToast } from "../hooks/useToast";

const GRAMOS_POR_C_IEN = 100;
const ZONA_ARGENTINA = "America/Argentina/Buenos_Aires";

// El backend guarda FechaHora como hora Argentina sin zona
// ("YYYY-MM-DDTHH:mm:ss"), así que el día calendario es el literal del string,
// sin reconvertir zonas.
function extraerDia(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ""));
  return match ? match[0] : null;
}

// Día calendario actual ("YYYY-MM-DD") en la zona horaria Argentina.
function diaEnArgentina(instante) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_ARGENTINA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instante);
}

function formatearFechaCorta(isoDia) {
  const [anio, mes, dia] = isoDia.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Cantidad legible segun la unidad del detalle: en modo kilos el backend la
// guarda en gramos y se convierte a kg para mostrarla; en Por-100-Gramos se
// muestra en gramos; los productos "Unidad" quedan sin sufijo.
function formatearCantidad(item) {
  if (esModoKilos(item.unidad_medida, item.unidad_precio)) {
    return `${aKilos(item.cantidad)} kg`;
  }
  if (item.unidad_medida === "Gramos") {
    return `${item.cantidad} g`;
  }
  return String(item.cantidad);
}

// Precio legible reconstruido desde el PrecioUnitario del detalle (que el
// backend guarda prorrateado por gramo). El Subtotal siempre usa el valor real.
function formatearPrecio(item) {
  if (esModoKilos(item.unidad_medida, item.unidad_precio)) {
    return `${formatCurrency(item.precio_unitario * GRAMOS_POR_KILO)}/kg`;
  }
  if (item.unidad_medida === "Gramos") {
    return `${formatCurrency(item.precio_unitario * GRAMOS_POR_C_IEN)} c/100 g`;
  }
  return formatCurrency(item.precio_unitario);
}

function SalesHistoryModal({
  ventas,
  isLoading = false,
  error = "",
  onClose,
  onDelete = async () => {},
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDia, setExpandedDia] = useState(null);
  const [ventaToDelete, setVentaToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const toast = useToast();

  const filtroActivo = Boolean(desde || hasta);

  // Filtro por rango de fechas sobre los datos ya cargados (las fechas llegan
  // en hora Argentina sin zona: comparación lexicográfica de "YYYY-MM-DD").
  const ventasFiltradas = useMemo(() => {
    if (!filtroActivo) return ventas;
    return ventas.filter((v) => {
      const dia = extraerDia(v.fecha);
      if (!dia) return false;
      if (desde && dia < desde) return false;
      if (hasta && dia > hasta) return false;
      return true;
    });
  }, [ventas, desde, hasta, filtroActivo]);

  // Agrupación por día calendario (conserva el orden del backend: más
  // reciente primero) con etiquetas "Hoy" / "Ayer" / fecha completa.
  const grupos = useMemo(() => {
    const hoy = diaEnArgentina(new Date());
    const fechaAyer = new Date();
    fechaAyer.setDate(fechaAyer.getDate() - 1);
    const ayer = diaEnArgentina(fechaAyer);
    const porDia = new Map();
    for (const v of ventasFiltradas) {
      const dia = extraerDia(v.fecha) ?? "";
      if (!porDia.has(dia)) porDia.set(dia, []);
      porDia.get(dia).push(v);
    }
    return Array.from(porDia, ([dia, items]) => ({
      dia,
      etiqueta:
        dia === hoy ? "Hoy" : dia === ayer ? "Ayer" : formatearFechaCorta(dia),
      total: items.reduce((sum, v) => sum + v.total, 0),
      items,
    }));
  }, [ventasFiltradas]);

  const limpiarFiltro = () => {
    setDesde("");
    setHasta("");
  };

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const toggleDia = (dia) =>
    setExpandedDia((prev) => (prev === dia ? null : dia));

  const requestDelete = (venta) => {
    setDeleteError("");
    setVentaToDelete(venta);
  };

  const confirmDelete = async () => {
    if (!ventaToDelete || deleting) return;
    setDeleting(true);
    try {
      await onDelete(ventaToDelete.id);
      if (expandedId === ventaToDelete.id) setExpandedId(null);
      setVentaToDelete(null);
      toast.success('La venta se eliminó correctamente');
    } catch (err) {
      setDeleteError(err.message);
      setVentaToDelete(null);
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/40 p-4 sm:items-center">
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">
              Historial de Ventas
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Ventas registradas en el punto de venta.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600"
            title="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="mb-5 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Desde
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Hasta
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            {filtroActivo && (
              <Button variant="secondary" size="sm" onClick={limpiarFiltro}>
                Limpiar filtro
              </Button>
            )}
          </div>
          {deleteError && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
              {deleteError}
            </p>
          )}
          {isLoading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Cargando ventas...
            </p>
          ) : error ? (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 ring-1 ring-inset ring-red-600/10">
              {error}
            </p>
          ) : ventas.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Todavía no hay ventas registradas.
            </p>
          ) : ventasFiltradas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500">
              No hay ventas en el rango seleccionado.
            </p>
          ) : (
            <ul className="space-y-4">
              {grupos.map((grupo) => {
                const diaExpandido = expandedDia === grupo.dia;
                const mostrarFecha =
                  grupo.etiqueta === "Hoy" || grupo.etiqueta === "Ayer";
                return (
                  <li key={grupo.dia}>
                    <button
                      onClick={() => toggleDia(grupo.dia)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50 ${diaExpandido ? "bg-gray-100" : "bg-white"}`}
                    >
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold text-gray-900">
                          {grupo.etiqueta}
                          {mostrarFecha && (
                            <span className="ml-2 text-xs font-medium text-gray-400">
                              {formatearFechaCorta(grupo.dia)}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          Total vendido:
                        </span>
                        <span className="font-display text-sm font-bold text-gray-900">
                          {formatCurrency(grupo.total)}
                        </span>
                        {diaExpandido ? (
                          <ChevronDown className="size-4 shrink-0 text-gray-400" />
                        ) : (
                          <ChevronRight className="size-4 shrink-0 text-gray-400" />
                        )}
                      </span>
                    </button>

                    {diaExpandido && (
                      <div className="mt-2 rounded-xl border border-gray-100 p-1.5">
                        <ul className="divide-y divide-gray-100">
                          {grupo.items.map((venta) => {
                            // El backend de ventas no expone el administrador; el nombre
                            // llega en venta.administrador_nombre solo si se agrega luego.
                            const admin =
                              venta.administrador_nombre ?? "Administrador";
                            const isExpanded = expandedId === venta.id;
                            return (
                              <li key={venta.id} className="py-2">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => toggleExpand(venta.id)}
                                    className="flex flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150 hover:bg-gray-50"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-gray-900">
                                        {formatFecha(venta.fecha)}
                                      </p>
                                      <p className="mt-0.5 truncate text-xs text-gray-500">
                                        {admin} · {venta.cantidad_items}{" "}
                                        productos ·{" "}
                                        {labelFormaPago(venta.forma_pago)}
                                      </p>
                                    </div>
                                    <span className="ml-auto font-display text-sm font-semibold text-gray-900">
                                      {formatCurrency(venta.total)}
                                    </span>
                                    {isExpanded ? (
                                      <ChevronDown className="size-4 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="size-4 text-gray-400" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => requestDelete(venta)}
                                    disabled={deleting}
                                    className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Eliminar venta"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="px-2 pb-3 pt-1">
                                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                              Producto
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                              Cant.
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                              Precio
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-4">
                                              Subtotal
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {venta.items.map((item) => (
                                            <tr key={item.producto_id}>
                                              <td className="px-3 py-2.5 text-sm text-gray-900 sm:px-4">
                                                {item.nombre}
                                              </td>
                                              <td className="px-3 py-2.5 text-right text-sm text-gray-500 sm:px-4">
                                                {formatearCantidad(item)}
                                              </td>
                                              <td className="px-3 py-2.5 text-right whitespace-nowrap text-sm text-gray-500 sm:px-4">
                                                {formatearPrecio(item)}
                                              </td>
                                              <td className="px-3 py-2.5 text-right whitespace-nowrap font-display text-sm font-semibold text-gray-900 sm:px-4">
                                                {formatCurrency(item.subtotal)}
                                              </td>
                                            </tr>
                                          ))}
                                          <tr className="bg-gray-50">
                                            <td
                                              colSpan="3"
                                              className="px-3 py-2.5 text-right text-sm font-medium text-gray-500 sm:px-4"
                                            >
                                              Total
                                            </td>
                                            <td className="px-3 py-2.5 text-right whitespace-nowrap font-display text-sm font-bold text-gray-900 sm:px-4">
                                              {formatCurrency(venta.total)}
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {ventaToDelete && (
        <ConfirmDialog
          title="Eliminar venta"
          message={`¿Eliminar la venta de ${formatFecha(
            ventaToDelete.fecha,
          )} por ${formatCurrency(ventaToDelete.total)}? Esta acción no se puede deshacer.`}
          warning="Esto no devuelve el stock a los productos automáticamente."
          confirmLabel="Eliminar"
          loading={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setVentaToDelete(null)}
        />
      )}
    </div>,
    document.body,
  );
}

export default SalesHistoryModal;
