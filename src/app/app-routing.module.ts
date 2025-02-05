import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// importacion de los componentes para establecerlo en las rutas
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SeleccionarPlataformaComponent } from './pages/seleccionar-plataforma/seleccionar-plataforma.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { FacturarComponent } from './pages/facturar/facturar.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { CreditosComponent } from './pages/creditos/creditos.component';
import { DetallesCreditoComponent } from './pages/detalles-credito/detalles-credito.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { PagoServiciosComponent } from './pages/pago-servicios/pago-servicios.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ProductosReservadosComponent } from './pages/productos-reservados/productos-reservados.component';
import { ImprimirFacturaComponent } from './pages/impresiones/imprimir-factura/imprimir-factura.component';
import { ImprimirInventarioComponent } from './pages/impresiones/imprimir-inventario/imprimir-inventario.component';
import { DetallesCompraComponent } from './pages/detalles-compra/detalles-compra.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { HistorialFacturasComponent } from './pages/historial-facturas/historial-facturas.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'ingresar', component: LoginComponent },
  { path: 'registrar', component: SignupComponent },
  { path: 'plataforma', component: SeleccionarPlataformaComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'facturar', component: FacturarComponent },
  { path: 'creditos', component: CreditosComponent },
  { path: 'detallesCredito', component: DetallesCreditoComponent },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'pagoservicios', component: PagoServiciosComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'sistemaApartado', component: ProductosReservadosComponent },
  { path: 'imprimirFactura', component: ImprimirFacturaComponent },
  { path: 'imprimirInventario', component: ImprimirInventarioComponent },
  { path: 'detallesCompra', component: DetallesCompraComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'historialFacturas', component: HistorialFacturasComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
