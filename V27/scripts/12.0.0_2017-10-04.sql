DECLARE @descripcion VARCHAR(MAX) = 'Listas de precios. Asginar lista de precio a cliente'
INSERT INTO db_backend.Releases VALUES (25, '12.0.0', GETDATE(), @descripcion)
GO

ALTER TABLE [db_backend].[Clientes]
ADD listaDePrecios_id INT NULL FOREIGN KEY REFERENCES [db_backend].[ListaDePrecios](id)
GO

INSERT INTO [db_backend].[TablasSatelites]
(id, nombreTabla, editable)
VALUES
(950, 'Tipos de Listas de Precios', 1);

GO

ALTER VIEW db_backend.VIEW_ArticulosDeListaDePrecios
AS
SELECT         
db_backend.ArticulosDeListaDePrecios.id, 
db_backend.ArticulosDeListaDePrecios.articulo_id, 
Articulos.nombreArticulo as nombreDeArticulo,
db_backend.ArticulosDeListaDePrecios.listaDePrecio_id, 
ListaDePrecio.nombre as nombreDeListaDePrecio,
db_backend.ArticulosDeListaDePrecios.precio,
db_backend.ArticulosDeListaDePrecios.activo, 
db_backend.ArticulosDeListaDePrecios.fechaAlta, 
db_backend.ArticulosDeListaDePrecios.usuarioAlta_id,
UsuariosAlta.nombreApellido as nombreApellidoAlta,
db_backend.ArticulosDeListaDePrecios.fechaBaja, 
db_backend.ArticulosDeListaDePrecios.usuarioBaja_id,
UsuariosBaja.nombreApellido as nombreApellidoBaja
FROM            db_backend.ArticulosDeListaDePrecios 
LEFT OUTER JOIN
				(SELECT id, nombreArticulo
				 FROM db_backend.Articulos) AS Articulos
			ON db_backend.ArticulosDeListaDePrecios.articulo_id = Articulos.id
LEFT OUTER JOIN
				(SELECT id, nombre
				 FROM db_backend.ListaDePrecios) AS ListaDePrecio
			ON db_backend.ArticulosDeListaDePrecios.id = ListaDePrecio.id
LEFT OUTER JOIN
				(SELECT id, nombreApellido
				 FROM db_security.Usuarios) AS UsuariosAlta
			ON db_backend.ArticulosDeListaDePrecios.usuarioAlta_id = UsuariosAlta.id
LEFT OUTER JOIN
				(SELECT id, nombreApellido
				 FROM db_security.Usuarios) AS UsuariosBaja
			ON db_backend.ArticulosDeListaDePrecios.usuarioBaja_id = UsuariosBaja.id
GO


ALTER VIEW db_backend.VIEW_ListaDePrecios
AS
SELECT         
db_backend.ListaDePrecios.id, 
db_backend.ListaDePrecios.nombre, 
db_backend.ListaDePrecios.fechaAlta, 
db_backend.ListaDePrecios.usuarioAlta_id,
UsuariosAlta.nombreApellido as nombreApellidoAlta,
db_backend.ListaDePrecios.activo, 
db_backend.ListaDePrecios.predeterminada,
db_backend.ListaDePrecios.descripcion,
db_backend.ListaDePrecios.tipoDeLista_ids, 
TiposListaDePreciosValoresSatelite.valorTexto AS tipoDeListaDePrecios, 
db_backend.ListaDePrecios.fechaBaja, 
db_backend.ListaDePrecios.usuarioBaja_id,
UsuariosBaja.nombreApellido as nombreApellidoBaja
FROM            db_backend.ListaDePrecios 
LEFT OUTER JOIN
                         db_backend.ValoresSatelintes(950) AS TiposListaDePreciosValoresSatelite 
						 ON db_backend.ListaDePrecios.tipoDeLista_ids = TiposListaDePreciosValoresSatelite.valor_ids
LEFT OUTER JOIN
				(SELECT id, nombreApellido
				 FROM db_security.Usuarios) AS UsuariosAlta
			ON db_backend.ListaDePrecios.usuarioAlta_id = UsuariosAlta.id
LEFT OUTER JOIN
				(SELECT id, nombreApellido
				 FROM db_security.Usuarios) AS UsuariosBaja
			ON db_backend.ListaDePrecios.usuarioBaja_id = UsuariosBaja.id
GO

INSERT INTO [db_backend].[ValoresTablasSatelites]
(valor_ids, valorTexto, codigoExterno, codigo, descripcion, tablaSatelites_id, editable)
VALUES
(2, 'Lista', 2, '2', 'Lista', 950, 1)
GO

SET IDENTITY_INSERT [db_frontend_web].[OpcionesMenu] ON

IF NOT EXISTS ( SELECT 1 FROM [db_frontend_web].[OpcionesMenu] WHERE id=236 )INSERT INTO [db_frontend_web].[OpcionesMenu] ([id],[nivel],[displayText] ,[codigoOpcion],[href],[iconoCss],[parent_menu_codigo],[orden],[visible], modulo, funcionalidad, descripcion)VALUES ( 236,2,'Listas de precios','LISTAS_PRECIOS','/ListaDePrecios','fa-list-ul','ARTICULOS',5,1,'Articulo','Listas de precios','Opción principal')
IF NOT EXISTS ( SELECT 1 FROM [db_frontend_web].[OpcionesMenu] WHERE id=237 )INSERT INTO [db_frontend_web].[OpcionesMenu] ([id],[nivel],[displayText] ,[codigoOpcion],[href],[iconoCss],[parent_menu_codigo],[orden],[visible], modulo, funcionalidad, descripcion)VALUES ( 237,2,'Alta de lista de precios','LISTAS_PRE_ALTA','','',NULL,0,0,'Articulo','Listas de precios','')
IF NOT EXISTS ( SELECT 1 FROM [db_frontend_web].[OpcionesMenu] WHERE id=238 )INSERT INTO [db_frontend_web].[OpcionesMenu] ([id],[nivel],[displayText] ,[codigoOpcion],[href],[iconoCss],[parent_menu_codigo],[orden],[visible], modulo, funcionalidad, descripcion)VALUES ( 238,2,'Editar lista de precios','LISTAS_PRE_EDIT','','',NULL,0,0,'Articulo','Listas de precios','')


SET IDENTITY_INSERT [db_frontend_web].[OpcionesMenu] OFF

INSERT INTO [db_backend].[ValoresTablasSatelites]
(valor_ids, valorTexto, codigoExterno, codigo, descripcion, tablaSatelites_id, editable)
VALUES
(3, 'Zona rural', 3, '3', 'Zona rural', 950, 1)