```javascript
let contadorRenglones = 0;


/* =========================
   INICIO
========================= */

document.addEventListener("DOMContentLoaded", () => {

    agregarRenglon();

    document
        .getElementById("agregarRenglon")
        .addEventListener("click", agregarRenglon);

    document
        .getElementById("vistaPrevia")
        .addEventListener("click", generarVistaPrevia);

    document
        .getElementById("descargarPDF")
        .addEventListener("click", descargarPDF);

});


/* =========================
   AGREGAR RENGLÓN
========================= */

function agregarRenglon() {

    contadorRenglones++;

    const contenedor = document.getElementById("renglones");

    const renglon = document.createElement("div");

    renglon.className = "renglon";

    renglon.dataset.numero = contadorRenglones;

    renglon.innerHTML = `

        <div class="renglon-header">

            <span class="renglon-numero">
                Renglón ${contadorRenglones}
            </span>

            ${
                contadorRenglones > 1
                ? `<button type="button"
                    class="btn-eliminar"
                    onclick="eliminarRenglon(this)">
                    Eliminar
                   </button>`
                : ""
            }

        </div>


        <div class="renglon-grid">

            <div class="campo">

                <label>Descripción</label>

                <input
                    type="text"
                    class="descripcion"
                    placeholder="Descripción del bien o servicio">

            </div>


            <div class="campo">

                <label>Cantidad</label>

                <input
                    type="number"
                    class="cantidad"
                    min="0"
                    step="any"
                    value="1">

            </div>


            <div class="campo">

                <label>Precio unitario</label>

                <input
                    type="number"
                    class="precio"
                    min="0"
                    step="0.01"
                    value="0">

            </div>


            <div class="campo">

                <label>Importe</label>

                <input
                    type="text"
                    class="importe"
                    value="$ 0,00"
                    readonly>

            </div>

        </div>

    `;


    contenedor.appendChild(renglon);


    const cantidad = renglon.querySelector(".cantidad");
    const precio = renglon.querySelector(".precio");
    const importe = renglon.querySelector(".importe");


    function actualizarImporte() {

        const c = parseFloat(cantidad.value) || 0;
        const p = parseFloat(precio.value) || 0;

        const resultado = c * p;

        importe.value = formatearMoneda(resultado);

    }


    cantidad.addEventListener("input", actualizarImporte);
    precio.addEventListener("input", actualizarImporte);

}


/* =========================
   ELIMINAR RENGLÓN
========================= */

function eliminarRenglon(boton) {

    const renglones = document.querySelectorAll(".renglon");

    // Nunca permitir quedar en cero
    if (renglones.length <= 1) {
        return;
    }

    boton.closest(".renglon").remove();

    renumerarRenglones();

}


/* =========================
   RENUMERAR
========================= */

function renumerarRenglones() {

    const renglones = document.querySelectorAll(".renglon");

    renglones.forEach((renglon, index) => {

        const numero = index + 1;

        renglon.dataset.numero = numero;

        const titulo = renglon.querySelector(".renglon-numero");

        titulo.textContent = `Renglón ${numero}`;

        const header = renglon.querySelector(".renglon-header");

        let botonEliminar = header.querySelector(".btn-eliminar");


        if (numero === 1) {

            if (botonEliminar) {
                botonEliminar.remove();
            }

        } else {

            if (!botonEliminar) {

                botonEliminar = document.createElement("button");

                botonEliminar.type = "button";

                botonEliminar.className = "btn-eliminar";

                botonEliminar.textContent = "Eliminar";

                botonEliminar.onclick = function () {
                    eliminarRenglon(this);
                };

                header.appendChild(botonEliminar);
            }

        }

    });

}


/* =========================
   VISTA PREVIA
========================= */

function generarVistaPrevia() {

    const documento = construirDocumentoPDF();

    const contenedor = document.getElementById("documentoPDF");

    contenedor.innerHTML = documento;

    document.getElementById("previewContainer").style.display = "block";

    window.scrollTo({
        top: document.getElementById("previewContainer").offsetTop,
        behavior: "smooth"
    });

}


/* =========================
   CONSTRUIR DOCUMENTO
========================= */

function construirDocumentoPDF() {

    const numeroOrden =
        document.getElementById("numeroOrden").value || "-";

    const fecha =
        document.getElementById("fechaOrden").value;

    const expediente =
        document.getElementById("expediente").value || "-";

    const proveedor =
        document.getElementById("proveedor").value || "-";

    const cuit =
        document.getElementById("cuit").value || "-";

    const destino =
        document.getElementById("destino").value || "-";

    const observaciones =
        document.getElementById("observaciones").value || "-";


    const fechaFormateada =
        fecha ? convertirFecha(fecha) : "-";


    const renglones =
        document.querySelectorAll(".renglon");


    let filas = "";

    let totalGeneral = 0;


    renglones.forEach((renglon, index) => {

        const descripcion =
            renglon.querySelector(".descripcion").value || "-";

        const cantidad =
            parseFloat(
                renglon.querySelector(".cantidad").value
            ) || 0;

        const precio =
            parseFloat(
                renglon.querySelector(".precio").value
            ) || 0;


        const importe = cantidad * precio;

        totalGeneral += importe;


        filas += `

            <tr>

                <td class="col-renglon">
                    ${index + 1}
                </td>

                <td class="col-descripcion">
                    ${escapeHTML(descripcion)}
                </td>

                <td class="col-cantidad">
                    ${cantidad}
                </td>

                <td class="col-precio">
                    ${formatearMoneda(precio)}
                </td>

                <td class="col-importe">
                    ${formatearMoneda(importe)}
                </td>

            </tr>

        `;

    });


    return `

        <div class="pdf-hoja">

            <div class="pdf-encabezado">

                <div class="pdf-organismo">
                    Ministerio de Juventud, Deportes y Cultura
                </div>

                <div class="pdf-provincia">
                    Provincia del Neuquén
                </div>

            </div>


            <div class="pdf-titulo">
                ORDEN DE COMPRA
            </div>


            <div class="pdf-datos">

                <div class="pdf-dato">
                    <span class="pdf-label">
                        N° Orden:
                    </span>
                    ${escapeHTML(numeroOrden)}
                </div>

                <div class="pdf-dato">
                    <span class="pdf-label">
                        Fecha:
                    </span>
                    ${fechaFormateada}
                </div>

                <div class="pdf-dato">
                    <span class="pdf-label">
                        Expediente:
                    </span>
                    ${escapeHTML(expediente)}
                </div>

                <div class="pdf-dato">
                    <span class="pdf-label">
                        Proveedor:
                    </span>
                    ${escapeHTML(proveedor)}
                </div>

                <div class="pdf-dato">
                    <span class="pdf-label">
                        CUIT:
                    </span>
                    ${escapeHTML(cuit)}
                </div>

                <div class="pdf-dato">
                    <span class="pdf-label">
                        Destino:
                    </span>
                    ${escapeHTML(destino)}
                </div>

            </div>


            <table class="tabla">

                <thead>

                    <tr>

                        <th class="col-renglon">
                            Renglón
                        </th>

                        <th class="col-descripcion">
                            Descripción
                        </th>

                        <th class="col-cantidad">
                            Cantidad
                        </th>

                        <th class="col-precio">
                            Precio unitario
                        </th>

                        <th class="col-importe">
                            Importe
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${filas}

                </tbody>

            </table>


            <div class="total">

                TOTAL:
                &nbsp;
                ${formatearMoneda(totalGeneral)}

            </div>


            <div class="pdf-observaciones">

                <strong>Observaciones:</strong>

                <br><br>

                ${escapeHTML(observaciones)}

            </div>


            <div class="pdf-pie">

                Orden de Compra — Provincia del Neuquén

            </div>

        </div>

    `;

}


/* =========================
   DESCARGAR PDF
========================= */

function descargarPDF() {

    const documento =
        document.getElementById("documentoPDF");


    if (!documento.innerHTML.trim()) {

        generarVistaPrevia();

    }


    setTimeout(() => {

        const opciones = {

            margin: 10,

            filename:
                obtenerNombreArchivo(),

            image: {
                type: "jpeg",
                quality: 0.98
            },

            html2canvas: {

                scale: 2,

                useCORS: true

            },

            jsPDF: {

                unit: "mm",

                format: "a4",

                orientation: "portrait"

            },

            pagebreak: {

                mode: [
                    "css",
                    "legacy"
                ]

            }

        };


        html2pdf()

            .set(opciones)

            .from(documento)

            .save();

    }, 300);

}


/* =========================
   UTILIDADES
========================= */

function convertirFecha(fecha) {

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return fecha;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function formatearMoneda(valor) {

    return valor.toLocaleString(
        "es-AR",
        {
            style: "currency",
            currency: "ARS"
        }
    );

}


function escapeHTML(texto) {

    return String(texto)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function obtenerNombreArchivo() {

    const numero =
        document.getElementById("numeroOrden").value
        || "orden";

    return `Orden_de_Compra_${numero}.pdf`;

}
```
