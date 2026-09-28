let numeroRenglon = 0;


/* ================================
   CUANDO CARGA LA PÁGINA
================================ */

document.addEventListener("DOMContentLoaded", function () {

    agregarRenglon();

    document
        .getElementById("btnAgregar")
        .addEventListener("click", function () {
            agregarRenglon();
        });

    document
        .getElementById("btnVistaPrevia")
        .addEventListener("click", function () {
            mostrarVistaPrevia();
        });

    document
        .getElementById("btnPDF")
        .addEventListener("click", function () {
            descargarPDF();
        });

});


/* ================================
   AGREGAR RENGLÓN
================================ */

function agregarRenglon() {

    numeroRenglon++;

    const contenedor =
        document.getElementById("listaRenglones");

    const renglon =
        document.createElement("div");

    renglon.className = "renglon";

    renglon.innerHTML = `

        <div class="renglon-cabecera">

            <span class="numero-renglon">
                Renglón ${numeroRenglon}
            </span>

            ${
                numeroRenglon > 1
                ?
                `<button
                    type="button"
                    class="btn-eliminar">
                    Eliminar
                </button>`
                :
                ""
            }

        </div>


        <div class="campos-renglon">

            <div>
                <label>Descripción</label>

                <input
                    type="text"
                    class="descripcion"
                    placeholder="Descripción del bien o servicio">
            </div>


            <div>
                <label>Cantidad</label>

                <input
                    type="number"
                    class="cantidad"
                    value="1"
                    min="0"
                    step="any">
            </div>


            <div>
                <label>Precio unitario</label>

                <input
                    type="number"
                    class="precio"
                    value="0"
                    min="0"
                    step="0.01">
            </div>


            <div>
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


    /* Cálculo automático */

    const cantidad =
        renglon.querySelector(".cantidad");

    const precio =
        renglon.querySelector(".precio");

    const importe =
        renglon.querySelector(".importe");


    function calcular() {

        const c =
            parseFloat(cantidad.value) || 0;

        const p =
            parseFloat(precio.value) || 0;

        const resultado = c * p;

        importe.value =
            formatearMoneda(resultado);
    }


    cantidad.addEventListener("input", calcular);

    precio.addEventListener("input", calcular);


    /* Botón eliminar */

    const botonEliminar =
        renglon.querySelector(".btn-eliminar");


    if (botonEliminar) {

        botonEliminar.addEventListener(
            "click",
            function () {

                renglon.remove();

                renumerarRenglones();

            }
        );

    }

}


/* ================================
   RENUMERAR
================================ */

function renumerarRenglones() {

    const renglones =
        document.querySelectorAll(".renglon");


    renglones.forEach(function (renglon, indice) {

        const numero =
            indice + 1;

        renglon.querySelector(
            ".numero-renglon"
        ).textContent =
            "Renglón " + numero;

    });

}


/* ================================
   VISTA PREVIA
================================ */

function mostrarVistaPrevia() {

    const contenedor =
        document.getElementById("documentoPDF");

    contenedor.innerHTML =
        construirDocumento();


    document.getElementById(
        "zonaPreview"
    ).style.display = "block";


    document.getElementById(
        "zonaPreview"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


/* ================================
   CONSTRUIR DOCUMENTO
================================ */

function construirDocumento() {

    const numeroOrden =
        obtenerValor("numeroOrden");

    const fecha =
        obtenerValor("fechaOrden");

    const expediente =
        obtenerValor("expediente");

    const proveedor =
        obtenerValor("proveedor");

    const cuit =
        obtenerValor("cuit");

    const destino =
        obtenerValor("destino");

    const observaciones =
        obtenerValor("observaciones");


    const renglones =
        document.querySelectorAll(".renglon");


    let filas = "";

    let total = 0;


    renglones.forEach(function (renglon, indice) {

        const descripcion =
            renglon.querySelector(
                ".descripcion"
            ).value || "-";


        const cantidad =
            parseFloat(
                renglon.querySelector(
                    ".cantidad"
                ).value
            ) || 0;


        const precio =
            parseFloat(
                renglon.querySelector(
                    ".precio"
                ).value
            ) || 0;


        const importe =
            cantidad * precio;


        total += importe;


        filas += `

            <tr>

                <td class="col-numero">
                    ${indice + 1}
                </td>

                <td class="col-descripcion">
                    ${escaparHTML(descripcion)}
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


    const fechaFormateada =
        convertirFecha(fecha);


    return `

        <div class="hoja-pdf">


            <div class="encabezado-pdf">

                <div class="organismo">
                    Ministerio de Juventud, Deportes y Cultura
                </div>

                <div class="provincia">
                    Provincia del Neuquén
                </div>

            </div>


            <div class="titulo-pdf">
                ORDEN DE COMPRA
            </div>


            <table class="datos-pdf">

                <tr>

                    <td>
                        <strong>N° Orden:</strong>
                        ${escaparHTML(numeroOrden || "-")}
                    </td>

                    <td>
                        <strong>Fecha:</strong>
                        ${fechaFormateada || "-"}
                    </td>

                </tr>


                <tr>

                    <td>
                        <strong>Expediente:</strong>
                        ${escaparHTML(expediente || "-")}
                    </td>

                    <td>
                        <strong>Proveedor:</strong>
                        ${escaparHTML(proveedor || "-")}
                    </td>

                </tr>


                <tr>

                    <td>
                        <strong>CUIT:</strong>
                        ${escaparHTML(cuit || "-")}
                    </td>

                    <td>
                        <strong>Destino:</strong>
                        ${escaparHTML(destino || "-")}
                    </td>

                </tr>

            </table>


            <table class="tabla-pdf">

                <thead>

                    <tr>

                        <th class="col-numero">
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


            <div class="total-pdf">

                TOTAL:
                ${formatearMoneda(total)}

            </div>


            <div class="observaciones-pdf">

                <strong>Observaciones:</strong>

                <br><br>

                ${escaparHTML(
                    observaciones || "-"
                )}

            </div>


            <div class="pie-pdf">

                Orden de Compra — Provincia del Neuquén

            </div>


        </div>

    `;

}


/* ================================
   DESCARGAR PDF
================================ */

function descargarPDF() {

    mostrarVistaPrevia();


    const documento =
        document.getElementById("documentoPDF");


    if (
        typeof html2pdf === "undefined"
    ) {

        alert(
            "No se pudo cargar el generador de PDF. Revisá la conexión a Internet."
        );

        return;
    }


    const opciones = {

        margin: 0,

        filename:
            obtenerNombreArchivo(),

        image: {
            type: "jpeg",
            quality: 0.98
        },

        html2canvas: {

            scale: 2,

            useCORS: true,

            logging: false

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

}


/* ================================
   FUNCIONES AUXILIARES
================================ */

function obtenerValor(id) {

    const elemento =
        document.getElementById(id);

    if (!elemento) {
        return "";
    }

    return elemento.value.trim();

}


function convertirFecha(fecha) {

    if (!fecha) {
        return "";
    }


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {
        return fecha;
    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

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


function escaparHTML(texto) {

    return String(texto)

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function obtenerNombreArchivo() {

    const numero =
        obtenerValor("numeroOrden");


    if (numero) {

        return (
            "Orden_de_Compra_" +
            numero +
            ".pdf"
        );

    }


    return "Orden_de_Compra.pdf";

}
