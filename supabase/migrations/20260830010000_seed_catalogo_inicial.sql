-- ============================================================================
-- Carga inicial del catalogo HERNANDAN (Agosto) con stock = 100 por producto
-- ============================================================================
-- Origen: HERNANDAN_AGOSTO.pdf. Cuando el catalogo agrupaba varios
-- aromas/colores bajo un mismo precio, se guarda una sola fila y la lista de
-- variantes queda en "descripcion" para no perder esa informacion.

insert into productos (nombre, precio, descripcion, stock) values
  ('Desengrasante H-7 - Paila 6 GAL', 103.20, null, 100),
  ('Desengrasante H-7 - Litro (caja 12 unid)', 6.77, null, 100),
  ('Desengrasante H-7 - Galón (caja 4 und)', 15.56, null, 100),

  ('Refrigerante H7 - Galón Verde (caja 4 und)', 7.14, null, 100),
  ('Refrigerante H7 - Galón Rojo (caja 4 und)', 7.14, null, 100),

  ('Limpiavidrio H7 - Litro (caja 12 und)', 3.53, null, 100),
  ('Limpiavidrio H7 - Galón (caja 4 und)', 6.53, null, 100),

  ('Ambientador Little Trees colgante (varios aromas)', 1.48,
   'Aromas: Black Ice, Bubble Gum, Carro Nuevo, Caribbean Colada, Cereza, Coco, Cotton Candy, Cuero, Dragon Fruit, Fresa, Lavanda, Gold, Manzana Canela, Manzana Verde, Patilla, Piña Colada, Pino, Rose Torn, Sliced, Supernova, True North, Vainilla USA, Vainilla',
   100),
  ('Exhibidor Ambientadores Little Trees - 8 peldaños (160 unidades)', 8.82, null, 100),

  ('WD-40 Lubricante 3 OZ (caja 12 unid)', 5.95, null, 100),
  ('WD-40 Lubricante 5.5 OZ (caja 12 unid)', 7.54, null, 100),
  ('WD-40 Lubricante 11 OZ (caja 12 unid)', 11.39, null, 100),
  ('WD-40 Limpia Carburador 13.5 OZ (caja 6 und)', 11.48, null, 100),
  ('WD-40 Lubricante Galón', 69.33, null, 100),
  ('WD-40 Tambor Lubricante Multiuso - Cuñete 5 galones', 268.00, null, 100),
  ('WD-40 Tambor Lubricante Multiuso - Tambor 55 galones', 2890.00, null, 100),

  ('STP Elevador de Octanaje 5.5 OZ (caja 12 und)', 6.28, null, 100),
  ('STP Limpiador de Inyectores 5.5 OZ (caja 12 und)', 5.75, null, 100),
  ('STP Aceite de Dirección 12 OZ (caja 6 und)', 5.75, null, 100),
  ('Tuff Stuff 22 OZ (caja 6 und)', 9.80, null, 100),
  ('STP Elevador de Octanaje 12 OZ (caja 6 und)', 9.86, null, 100),
  ('STP Limpiador de Inyectores 12 OZ (caja 6 und)', 8.12, null, 100),
  ('STP Aceite de Dirección 32 OZ (caja 6 und)', 13.30, null, 100),

  ('Armor All Lustrador para Tapicerías 4 OZ (caja 12 unid)', 3.88, null, 100),
  ('Armor All Lustrador para Tapicerías 10 OZ (caja 12 unid)', 4.94, null, 100),
  ('Armor All Tratamiento para Cuero 18 OZ (caja 12 unid)', 14.11, null, 100),

  ('3-En-Uno Lubricante Gotero 30 ML (caja 12 unidades)', 1.98, null, 100),
  ('3-En-Uno Lubricante Gotero 90 ML (caja 12 unidades)', 3.03, null, 100),
  ('3-En-Uno Aceite en Spray 161 ML (caja 6 unidades)', 5.98, null, 100),
  ('3-En-Uno Limpia Contacto 300 ML (caja 6 unidades)', 9.21, null, 100),

  ('Ambientador Super Organic (varios aromas)', 3.66,
   'Aromas Super Organic: Berry Punch, Black Ice, Blue Lava, Carro Nuevo, Cereza, Cran Burst, Gold, Pure Sunshine, Tropic, Tsunami, Vainilla',
   100),
  ('Ambientador Slim Gel 90 Super Organic (mín. 12 unid surtido)', 3.72,
   'Aromas Slim Gel 90: Cherry, Carro Nuevo, Gold, Berry, Tropic',
   100),

  ('Paño Gamusa Tipo Chamois (pack 6 unidades)', 8.02, null, 100),
  ('Paños Microfibra Ultra Absorbente (pack 3 pcs)', 3.88, null, 100),

  ('Ambientador Little Trees Lata-Corcho (mín. 12 unid surtido)', 4.34,
   'Aromas: Cherry, Carro Nuevo, Black Ice, Manzana Verde, Caribbean Colada',
   100),

  ('Pila Energizer 2016 (litio)', 1.48, null, 100),
  ('Pila Energizer 2032 (litio)', 1.48, null, 100),
  ('Pila Energizer 2025 (litio)', 1.48, null, 100),
  ('Pila Energizer A23', 2.38, null, 100),
  ('Pila Energizer A27', 1.90, null, 100),

  ('Pila Energizer MAX AA x2', 1.98, null, 100),
  ('Pila Energizer MAX AA x4', 3.73, null, 100),
  ('Pila Energizer MAX AAA x2', 1.98, null, 100),
  ('Pila Energizer MAX AAA x4', 3.73, null, 100),

  ('Bombillo 1 Contacto Base Metal - Cod. 1073 (mín. 20 und)', 0.46, null, 100),
  ('Bombillo 2 Contactos Base Metal - Cod. 1034 (mín. 20 und)', 0.46, null, 100),
  ('Bombillo 1 Contacto Base Vidrio - Cod. 7440 (mín. 20 und)', 1.76, null, 100),
  ('Bombillo 2 Contactos Base Vidrio - Cod. 7443 (mín. 20 und)', 1.76, null, 100),
  ('Bombillo 1 Contacto Base Plástica - Cod. 3156 (mín. 20 und)', 1.56, null, 100),

  ('Bombillo Tablero 53 (mín. 30 und)', 0.28, null, 100),
  ('Bombillo Tablero 57 (mín. 30 und)', 0.84, null, 100),
  ('Bombillo 1 Contacto 67 (mín. 20 und)', 0.37, null, 100),
  ('Bombillo 1 Contacto 912 T15 (mín. 20 und)', 0.41, null, 100),
  ('Bombillo Tablero - Cruce 158 T10 (mín. 30 und)', 0.28, null, 100),
  ('Bombillo Tablero - Cruce 158 LED White (mín. 20 und)', 0.84, null, 100),

  ('Bombillo 1 Contacto Base Metal Ámbar - Cod. 1156A (mín. 20 und)', 0.48, null, 100),
  ('Bombillo 2 Contacto Base Metal Ámbar - Cod. 1157A (mín. 20 und)', 0.48, null, 100),
  ('Bombillo H4 P43 100/90W 12V (mín. 10 und)', 2.43, null, 100),
  ('Socate Bombillo H4 P43 - Cod. AR160R (mín. 10 und)', 2.12, null, 100),

  ('Fusible ATO Mini 15A-20A-25A-30A (pack 200 pcs c/u)', 0.14, null, 100),
  ('Fusible ATO Normal 10A-15A-20A-25A-30A-35A (pack 100 pcs c/u)', 0.14, null, 100),
  ('Porta Fusible ATO Mini - Cod. L1444 (mín. 10 und)', 1.67, null, 100),
  ('Porta Fusible ATO - Cod. PFN 182 (mín. 10 und)', 2.42, null, 100),

  ('Filtro de Gasolina Universal Interfil - Cod. FGI-024 (mín. 12 und)', 3.32, null, 100),
  ('Agua de Batería Champion (caja 12 unidades)', 1.98, null, 100),
  ('Borne de Seguridad de Bronce en Blister - Cod. 11-250', 13.37, null, 100),
  ('Porta Fusible Reforzado de Vidrio - Cod. FH-1-14 (bolsa 10 und)', 0.48, null, 100),

  ('Medidor de Aire Recto 50 LB P.C.L (caja 6 und)', 1.89, null, 100),
  ('Medidor de Aire Curvo 50 LB P.C.L (caja 6 und)', 1.89, null, 100),
  ('Medidor de Aire Doble Boca 120 LB P.C.L (caja 6 und)', 3.62, null, 100);
