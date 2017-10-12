DECLARE @descripcion VARCHAR(MAX) = 'Filtros en Libro de IVA por centro de facturacion. Corrección en PDF de comprobante fiscal'
INSERT INTO db_backend.Releases VALUES (26, '12.0.1', GETDATE(), @descripcion)
GO

ALTER PROCEDURE [dbo].[ObtenerComprobantesFiscalesPorPeriodo] 
	@perido VARCHAR(6),
	@centroDeFacturacionId INT
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

    SELECT COMPROBANTES.* FROM (
			
		SELECT 
		COMP.id,
		CONVERT(nvarchar(6), COMP.fechaFactura, 112) as perdiodo,
		COMP.fechaFactura,
		COMP.tipoComprobanteAfip_ids,
		COMP.puntoDeVenta,
		COMP.numeroDeComprobanteAfip as nroComprobante,
		COMP.numeroDeComprobanteAfip as nroComprobanteDesde,
		COMP.numeroDeComprobanteAfip as nroComprobanteHasta,
		'IN' as concepto,
		COMP.nombreCliente as razonSocial,
		CASE 
			WHEN COMP.condicionIvaCliente_ids = 1 THEN 1 
			WHEN COMP.condicionIvaCliente_ids = 2 THEN 3
			WHEN COMP.condicionIvaCliente_ids = 3 THEN 7
			WHEN COMP.condicionIvaCliente_ids = 4 THEN 6 
			ELSE 0 END as idCondicionIva,
		COMP.tipoDeDocumento_ids,
		IIF(COMP.documentoCliente = '0' OR COMP.documentoCliente = '', NULL, COMP.documentoCliente) as dcumentoCliente,
		COMP.totalFactura as totalComprobante,
		COMP.ajusteFacturacion_id,
		COMP.factura_id
		FROM [db_backend].ComprobantesFiscales COMP
		WHERE COMP.numeroDeComprobanteAfip IS NOT NULL AND COMP.centroDeFacturacion_id = @centroDeFacturacionId 
	) COMPROBANTES WHERE COMPROBANTES.perdiodo = @perido
END