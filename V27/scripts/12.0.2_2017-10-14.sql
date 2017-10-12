DECLARE @descripcion VARCHAR(MAX) = 'Se agrega la cantidad de abonos en la imputación de abonos. Asignación de lista de precios a cliente'
INSERT INTO db_backend.Releases VALUES (27, '12.0.2', GETDATE(), @descripcion)
GO

ALTER TABLE [db_backend].[ArticulosXAbono_Disponibles]
ADD cantidadAbonos INT NULL
GO

ALTER VIEW [db_backend].[VIEW_Clientes]
AS
SELECT        db_backend.Clientes.id AS cliente_id, db_backend.Clientes.nombreCliente, db_backend.Repartos.nombreReparto, db_security.Usuarios.nombreApellido AS nombrePromotor, db_backend.Clientes.actividad_ids, 
                         db_backend.Clientes.tipoCliente_ids, db_backend.Clientes.estadoCliente_ids, db_backend.Clientes.promotor_id, db_backend.Clientes.reparto_id, db_backend.Clientes.dniCliente, VIEW_Domicilios_1.nombreProvincia, 
                         VIEW_Domicilios_1.nombreCiudad, VIEW_Domicilios_1.nombreBarrio, VIEW_Domicilios_1.nombreCiudad + ', ' + VIEW_Domicilios_1.nombreCalle + CASE WHEN VIEW_Domicilios_1.numeroPuerta IS NOT NULL 
                         THEN ' ' + VIEW_Domicilios_1.numeroPuerta + '. ' ELSE '' END + CASE WHEN VIEW_Domicilios_1.torre IS NOT NULL 
                         THEN ' torre ' + VIEW_Domicilios_1.torre + '. ' ELSE '' END + CASE WHEN VIEW_Domicilios_1.piso IS NOT NULL THEN ' piso ' + VIEW_Domicilios_1.piso + '. ' ELSE '' END + CASE WHEN VIEW_Domicilios_1.depto IS NOT NULL
                          THEN ' depto ' + VIEW_Domicilios_1.depto + '. ' ELSE '' END + CASE WHEN VIEW_Domicilios_1.lote IS NOT NULL 
                         THEN ' lote ' + VIEW_Domicilios_1.lote + '. ' ELSE '' END + CASE WHEN VIEW_Domicilios_1.manzana IS NOT NULL THEN ' manzana ' + VIEW_Domicilios_1.manzana + '. ' ELSE '' END AS domicilioCompleto, 
                         VIEW_Domicilios_1.provincia_ids, VIEW_Domicilios_1.ciudad_id, VIEW_Domicilios_1.barrio_id, VIEW_Domicilios_1.calle_id, VIEW_Domicilios_1.torre, VIEW_Domicilios_1.piso, VIEW_Domicilios_1.depto, 
                         VIEW_Domicilios_1.manzana, VIEW_Domicilios_1.lote, VIEW_Domicilios_1.numeroPuerta, VIEW_Domicilios_1.nombreCalle, db_backend.SAT_Actividades_Clientes.valorTexto AS actividadCliente, 
                         db_backend.SAT_Tipos_Clientes.valorTexto AS tipoCliente, db_backend.SAT_Estados_Clientes.valorTexto AS estadoCliente, db_backend.Clientes.datosCompletos, db_backend.Clientes.clientePadre, 
                         db_backend.Clientes.fechaNacimiento, db_backend.Clientes.fechaIngreso, VIEW_Domicilios_1.codigoPostal, VIEW_Domicilios_1.altitud, VIEW_Domicilios_1.longitud, db_backend.Clientes.fechaUtlimaEntrega, 
                         db_backend.Clientes.fechaUltimoCobroFactura, db_backend.Clientes.fechaUltimoCobroConsumos, db_backend.Clientes.fechaUltimaEnvases, db_backend.Clientes.fechaUltimaDevoluciones, 
                         db_backend.DatosFacturacion.validarOrdenesDeCompra, db_backend.DatosFacturacion.validaCredito, db_backend.DatosFacturacion.creditoPermitido, db_backend.DatosFacturacion.limiteFacturas, 
                         db_backend.DatosFacturacion.facturacionAutomatica, db_backend.Clientes.datosFacturacion_id, db_backend.DatosFacturacion.condicionIva_ids, db_backend.DatosFacturacion.tipoFactura_ids, 
                         db_backend.DatosFacturacion.cuit, db_backend.DatosFacturacion.dniPersona, db_backend.DatosFacturacion.ingresosBrutos, db_backend.DatosFacturacion.domicioFiscal, db_backend.DatosFacturacion.razonSocial, 
                         db_backend.DatosFacturacion.conRemito, db_backend.Clientes.zona_ids, db_backend.Clientes.fechaBaja, SAT_Zonas.valorTexto AS zona, db_backend.DatosFacturacion.centroFacturacion_id, 
                         db_backend.Clientes.listaDePrecios_id
FROM            db_backend.Clientes WITH (NOLOCK) INNER JOIN
                         db_backend.SAT_Tipos_Clientes ON db_backend.Clientes.tipoCliente_ids = db_backend.SAT_Tipos_Clientes.valor_ids INNER JOIN
                         db_backend.SAT_Estados_Clientes ON db_backend.Clientes.estadoCliente_ids = db_backend.SAT_Estados_Clientes.valor_ids LEFT OUTER JOIN
                         db_backend.ValoresSatelintes(690) AS SAT_Zonas ON db_backend.Clientes.zona_ids = SAT_Zonas.valor_ids LEFT OUTER JOIN
                         db_backend.SAT_Actividades_Clientes ON db_backend.Clientes.actividad_ids = db_backend.SAT_Actividades_Clientes.valor_ids LEFT OUTER JOIN
                         db_backend.VIEW_Domicilios AS VIEW_Domicilios_1 ON db_backend.Clientes.domicilio_id = VIEW_Domicilios_1.id LEFT OUTER JOIN
                         db_backend.Repartos WITH (NOLOCK) ON db_backend.Clientes.reparto_id = db_backend.Repartos.id LEFT OUTER JOIN
                         db_backend.DatosFacturacion WITH (NOLOCK) ON db_backend.Clientes.datosFacturacion_id = db_backend.DatosFacturacion.id LEFT OUTER JOIN
                         db_security.Usuarios WITH (NOLOCK) ON db_backend.Clientes.promotor_id = db_security.Usuarios.id
WHERE        (db_backend.Clientes.eliminado = 0)
GO



ALTER VIEW [db_backend].[VIEW_ArticulosXVentasEntregas]
AS
SELECT db_backend.VIEW_AUX_ArticulosXVentasEntregas.id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.articulo_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.ventaEntrega_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.precioUnitario, db_backend.VIEW_AUX_ArticulosXVentasEntregas.cantidad, db_backend.VIEW_AUX_ArticulosXVentasEntregas.factorIVA, 
         db_backend.VIEW_AUX_ArticulosXVentasEntregas.cliente_id, db_backend.VIEW_Articulos.codigoInterno, 
         CASE WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 1 THEN db_backend.VIEW_Articulos.nombreArticulo WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 2 THEN db_backend.VIEW_Articulos.nombreArticulo WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 3 THEN db_backend.VIEW_Articulos.nombreArticulo WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 4
          THEN ISNULL(db_backend.VIEW_AUX_ArticulosXVentasEntregas.leyenda, db_backend.AbonosClientes.leyendaFactura) 
         WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 5 THEN db_backend.VIEW_Articulos.nombreArticulo WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 6 THEN db_backend.VIEW_Articulos.nombreArticulo WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 8 THEN ISNULL(db_backend.VIEW_AUX_ArticulosXVentasEntregas.leyenda, 'Item sin descripción') 
         WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 9 THEN ISNULL(db_backend.VIEW_AUX_ArticulosXVentasEntregas.leyenda, db_backend.VIEW_Articulos.nombreArticulo) 
		 WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 10 
			THEN ISNULL(db_backend.VIEW_AUX_ArticulosXVentasEntregas.leyenda, db_backend.VIEW_Articulos.nombreArticulo) 
		 END AS nombreArticulo, db_backend.VIEW_AUX_ArticulosXVentasEntregas.fechaVenta, db_backend.VIEW_AUX_ArticulosXVentasEntregas.articuloAbono_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.articuloComodato_id, 
         ISNULL(db_backend.Clientes.clientePadre, db_backend.VIEW_AUX_ArticulosXVentasEntregas.cliente_id) AS clienteFacturable_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.abono_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.clienteEntrega_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.visita_id, db_backend.VIEW_AUX_ArticulosXVentasEntregas.hojaRuta_id, 
         db_backend.VIEW_AUX_ArticulosXVentasEntregas.esImputacionAbono, db_backend.VentasEntregas.factura_id, CASE WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 4 THEN db_backend.AbonosClientes.ivaNoExcentos ELSE db_backend.VIEW_Articulos.tipoDeIva_facturaA END AS ivaNoExcentos, 
         CASE WHEN db_backend.VIEW_AUX_ArticulosXVentasEntregas.tipoItem_id = 4 THEN db_backend.AbonosClientes.ivaExcentos ELSE db_backend.VIEW_Articulos.tipoDeIva_consumidorFinal END AS ivaExcentos, db_backend.VIEW_AUX_ArticulosXVentasEntregas.leyenda, db_backend.VIEW_AUX_ArticulosXVentasEntregas.facturaDeItem_id
FROM  db_backend.VentasEntregas INNER JOIN
         db_backend.VIEW_AUX_ArticulosXVentasEntregas ON db_backend.VentasEntregas.id = db_backend.VIEW_AUX_ArticulosXVentasEntregas.ventaEntrega_id LEFT OUTER JOIN
         db_backend.AbonosClientes LEFT OUTER JOIN
         db_backend.Clientes ON db_backend.AbonosClientes.cliente_id = db_backend.Clientes.id ON db_backend.VIEW_AUX_ArticulosXVentasEntregas.abono_id = db_backend.AbonosClientes.id LEFT OUTER JOIN
         db_backend.VIEW_Articulos ON db_backend.VIEW_AUX_ArticulosXVentasEntregas.articulo_id = db_backend.VIEW_Articulos.id

GO


