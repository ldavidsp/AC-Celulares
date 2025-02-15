import { Component, OnInit, ViewChild } from '@angular/core';

// importacion del componente del NavSide
import { NavsideComponent } from '../navside/navside.component';

// importacion del Chart.js
import { Chart } from 'chart.js';

// importacoin del servicio
import { ServicioService } from '../../servicios/servicio.service';

// se importa los componentes de la base de datos
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';

// importacion de las interfaces
import { VentasMensuales } from './../../interfaces/ventas/mes/ventas-mensuales';
import { VentasDiarias } from './../../interfaces/ventas/dia/ventas-diarias';
import { TipoProductos } from './../../interfaces/ventas/tipo-productos';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  // variable que determina en que plataforma esta
  plataforma = '';

  // variable que contendra el string de la fecha y hora
  fechaHora = '';

  // variable que contendra todos los meses
  // tslint:disable-next-line:max-line-length
  meses: string[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // variable que contendra todos los dias de la semana
  diasSemana: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // variables de tipo document observable para los graficos de las ventas
  @ViewChild('graficoVentasDiaCanvas') graficoVentasDiaCanvas;
  @ViewChild('graficoVentasSemanaCanvas') graficoVentasSemanaCanvas;
  @ViewChild('graficoVentasAnualCanvas') graficoVentasAnualCanvas;

  // variables que contendran el contenido del grafico para las ventas
  graficoVentasDiaChart: any;
  graficoVentasSemanaChart: any;
  graficoVentasAnualChart: any;

  // variables de tipo document observable para los graficos de las ganancias
  @ViewChild('graficoGananciasDiaCanvas') graficoGananciasDiaCanvas;
  @ViewChild('graficoGananciasSemanaCanvas') graficoGananciasSemanaCanvas;
  @ViewChild('graficoGananciasAnualCanvas') graficoGananciasAnualCanvas;

  // variables que contendran el contenido del grafico para las ganancias
  graficoGananciasDiaChart: any;
  graficoGananciasSemanaChart: any;
  graficoGananciasAnualChart: any;

  // tslint:disable-next-line:max-line-length
  // variables que contendran los datos que se enviaran a firestore cada vez que alguien se meta al dashboard o inicie sesion para las ventas
  pushVentasSemana: TipoProductos;
  pushVentasMensuales: TipoProductos;
  pushVentasDiarias: VentasDiarias;

  // tslint:disable-next-line:max-line-length
  // variables que contendran los datos que se enviaran a firestore cada vez que alguien se meta al dashboard o inicie sesion para las ganancias
  pushGananciasSemana: TipoProductos;
  pushGananciasMensuales: TipoProductos;
  pushGananciasDiarias: VentasDiarias;

  // variables que contendra los datos del grafico semanal
  public datosVentasSemanaFirestore: TipoProductos;
  public datosVentasSemanaLocal: TipoProductos;
  public totalVentasSemana = 0;

  // variables que contendran los datos del grafico anual
  public datosVentasAnualFirestore: TipoProductos;
  public datosVentasAnualesLocal: TipoProductos;
  public totalVentasAnual = 0;

  // variables que contendran los datos del grafico diario
  public datosVentasDiarioFirestore: VentasDiarias;
  public datosVentasDiarioLocal: number[];
  public totalVentasDia = 0;

  // variable que contendra los datos del grafico de las ganancias semanales
  public datosGananciasSemanaFirestore: TipoProductos;
  public datosGananciasSemanaLocal: TipoProductos;
  public totalGananciasSemana = 0;

  // variables que contendra los datos del grafico de las ganancias anuales
  public datosGananciasAnualFirestore: TipoProductos;
  public datosGananciasAnualesLocal: TipoProductos;
  public totalGananciasAnual = 0;

  // variables que contendran los datlos del grafico de ganancias diarias
  public datosGananciasDiarioFirestore: VentasDiarias;
  public datosGananciasDiarioLocal: number[];
  public totalGananciasDia = 0;



  constructor(
    public nav: NavsideComponent,
    public servicio: ServicioService,
    public fs: AngularFirestore,
    public db: AngularFireDatabase
  ) {

    const tiempo = new Date();

    // se extraen los datos de firestore de la semana actual para mostrarlo en los graficos correctamente para las ventas
    // tslint:disable-next-line:max-line-length
    this.fs.doc<TipoProductos>(`AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana${this.servicio.extraerNumeroSemana()}`)
      .snapshotChanges().subscribe(semana => {
        this.datosVentasSemanaFirestore = semana.payload.data();
        this.datosVentasSemanaLocal = this.datosVentasSemanaFirestore;
        this.totalVentasSemana = semana.payload.data().TotalVentas;
        setTimeout(() => {
          this.generarGraficoVentasSemana();
        }, 1000);
      });

    // se extraen los datos de firestore del mes actual para mostrar en los graficos anuales correctamente para las ventas
    this.fs.doc<TipoProductos>(`AC Celulares/Control/Ventas/${this.servicio.tienda}/Anuales/${this.servicio.extraerAno()}`)
      .snapshotChanges().subscribe(anuales => {
        this.datosVentasAnualFirestore = anuales.payload.data();
        this.datosVentasAnualesLocal = this.datosVentasAnualFirestore;
        this.totalVentasAnual = anuales.payload.data().TotalVentas;
        setTimeout(() => {
          this.generarGraficoVentasAnual();
        }, 1000);
      });

    // se extraen los datos de firestore del dia actual para mostrar en los graficos diarios correctamente para las ventas
    // tslint:disable-next-line:max-line-length
    this.fs.doc<VentasDiarias>(`AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/${tiempo.getDate()}-${this.servicio.meses[tiempo.getMonth()]}-${tiempo.getFullYear()}`)
      .snapshotChanges().subscribe(diario => {
        this.datosVentasDiarioFirestore = diario.payload.data();
        this.datosVentasDiarioLocal = this.datosVentasDiarioFirestore.Datos;
        this.totalVentasDia = diario.payload.data().TotalVentas;
        setTimeout(() => {
          this.generarGraficoVentasDiario();
        }, 1000);
      });

    // se extraen los datos de firestore de la semana actual para mostrarlo en los graficos correctamente para las ganancias
    // tslint:disable-next-line:max-line-length
    this.fs.doc<TipoProductos>(`AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana${this.servicio.extraerNumeroSemana()}`)
      .snapshotChanges().subscribe(semana => {
        this.datosGananciasSemanaFirestore = semana.payload.data();
        this.datosGananciasSemanaLocal = this.datosGananciasSemanaFirestore;
        this.totalGananciasSemana = semana.payload.data().TotalVentas;
        setTimeout(() => {
          this.generarGraficoGananciasSemana();
        }, 1000);
      });

    // se extraen los datos de firestore del mes actual para mostrar en los graficos anuales correctamente para las ganancias
    this.fs.doc<TipoProductos>(`AC Celulares/Control/Ganancias/${this.servicio.tienda}/Anuales/${this.servicio.extraerAno()}`)
      .snapshotChanges().subscribe(anuales => {
        this.datosGananciasAnualFirestore = anuales.payload.data();
        this.datosGananciasAnualesLocal = this.datosGananciasAnualFirestore;
        this.totalGananciasAnual = anuales.payload.data().TotalVentas;
        setTimeout(() => {
          this.generarGraficoGananciasAnual();
        }, 1000);
      });

    // se extraen los datos de firestore del dia actual para mostrar en los graficos diarios correctamente para las ganancias
    // tslint:disable-next-line:max-line-length
    this.fs.doc<VentasDiarias>(`AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/${tiempo.getDate()}-${this.servicio.meses[tiempo.getMonth()]}-${tiempo.getFullYear()}`)
      .snapshotChanges().subscribe(diario => {
        this.datosGananciasDiarioFirestore = diario.payload.data();
        this.datosGananciasDiarioLocal = this.datosGananciasDiarioFirestore.Datos;
        this.totalGananciasDia = diario.payload.data().TotalVentas;
        setTimeout(() => {
          this.generarGraficoGananciasDiario();
        }, 1000);
      });


    // se generan las variables de ventas para posteriormente mandarlas a llamar desde su respectivo grafico
    this.pushVentasSemana = {
      TotalVentas: 0,
      Accesorios: [0, 0, 0, 0, 0, 0, 0],
      Repuestos: [0, 0, 0, 0, 0, 0, 0],
      Celulares: [0, 0, 0, 0, 0, 0, 0],
      Servicio: [0, 0, 0, 0, 0, 0, 0],
      Herramientas: [0, 0, 0, 0, 0, 0, 0]
    };
    this.pushVentasMensuales = {
      TotalVentas: 0,
      Accesorios: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Repuestos: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Celulares: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Servicio: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Herramientas: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
    this.pushVentasDiarias = {
      Datos: [0, 0, 0, 0, 0],
      TotalVentas: 0
    };

    // se generan las variables de ganancias para posteriormente mandarlas a llamar desde su respectivo grafico
    this.pushGananciasSemana = {
      TotalVentas: 0,
      Accesorios: [0, 0, 0, 0, 0, 0, 0],
      Repuestos: [0, 0, 0, 0, 0, 0, 0],
      Celulares: [0, 0, 0, 0, 0, 0, 0],
      Servicio: [0, 0, 0, 0, 0, 0, 0],
      Herramientas: [0, 0, 0, 0, 0, 0, 0]
    };
    this.pushGananciasMensuales = {
      TotalVentas: 0,
      Accesorios: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Repuestos: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Celulares: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Servicio: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      Herramientas: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
    this.pushGananciasDiarias = {
      Datos: [0, 0, 0, 0, 0],
      TotalVentas: 0
    };

    this.nav.mostrarNav = true;

    // le asigna el valor a la plataforma segun la tienda en la que se encuentra
    switch (this.servicio.tienda) {
      case 'Tienda Principal':
        this.plataforma = '';
        break;
      case 'Tienda 2':
        this.plataforma = 'Tienda 2';
        break;
      case 'Tienda 3':
        this.plataforma = 'Tienda 3';
        break;
      default:
        this.plataforma = '';
        break;
    }
    // mostrar el navside
    this.nav.mostrarNav = true;

    // se manda a llamar a la funcion para mostrar la hora
    this.extraerFechaHora();
  }

  ngOnInit() {
    const tiempo = new Date();

    // se realizan las tomas de decisiones y se suben los datos a firestore para el grafico semanal y su correcto funcionamiento
    if (this.servicio.extraerNumeroSemana() === 52) {

      // para las ventas
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushVentasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushVentasSemana);
        });
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana53`).set(this.pushVentasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana53`).set(this.pushVentasSemana);
        });

      // para las ganancias
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushGananciasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushGananciasSemana);
        });
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana53`).set(this.pushGananciasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana53`).set(this.pushGananciasSemana);
        });
    } else if (this.servicio.extraerNumeroSemana() === 53) {

      // para las ventas
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushVentasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushVentasSemana);
        });

      // para las ganancias
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushGananciasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno() + 1}/Datos/Semana1`).set(this.pushGananciasSemana);
        });
    } else {

      // para las ventas
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana${this.servicio.extraerNumeroSemana() + 1}`).set(this.pushVentasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana${this.servicio.extraerNumeroSemana() + 1}`).set(this.pushVentasSemana);
        });

      // para las ganancias
      // tslint:disable-next-line:max-line-length
      this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana${this.servicio.extraerNumeroSemana() + 1}`).set(this.pushGananciasSemana)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Semanales/${this.servicio.extraerAno()}/Datos/Semana${this.servicio.extraerNumeroSemana() + 1}`).set(this.pushGananciasSemana);
        });
    }

    // se actualizan los datos del año siguiente al actual para su mejor funcionamiento
    // para las ventas
    // tslint:disable-next-line:max-line-length
    this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Anuales/${this.servicio.extraerAno() + 1}`).set(this.pushVentasMensuales)
      .then(res => {
        // tslint:disable-next-line:max-line-length
        this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Anuales/${this.servicio.extraerAno() + 1}`).set(this.pushVentasMensuales);
      });

    // para las ganancias
    // tslint:disable-next-line:max-line-length
    this.fs.doc<TipoProductos>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Anuales/${this.servicio.extraerAno() + 1}`).set(this.pushGananciasMensuales)
      .then(res => {
        // tslint:disable-next-line:max-line-length
        this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Anuales/${this.servicio.extraerAno() + 1}`).set(this.pushGananciasMensuales);
      });


    // se realizan las tomas de deciiones y se suben los datos a firestore para el grafico anual y su correcto funcionamiento
    if ((tiempo.getMonth() === 11) && (tiempo.getDate() === 31)) {

      // para las ventas
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno() + 1}/Datos/1-Enero-${tiempo.getFullYear() + 1}`).set(this.pushVentasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno() + 1}/Datos/1-Enero-${tiempo.getFullYear() + 1}`).set(this.pushVentasDiarias);
        });

      // para las ganancias
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno() + 1}/Datos/1-Enero-${tiempo.getFullYear() + 1}`).set(this.pushGananciasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno() + 1}/Datos/1-Enero-${tiempo.getFullYear() + 1}`).set(this.pushGananciasDiarias);
        });

    } else if (((tiempo.getMonth() === 2) && (tiempo.getDate() === 28)) || ((tiempo.getMonth() === 2) && (tiempo.getDate() === 29))) {

      // para las ventas
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-Marzo-${tiempo.getFullYear()}`).set(this.pushVentasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-Marzo-${tiempo.getFullYear()}`).set(this.pushVentasDiarias);
        });

      // para las ganancias
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-Marzo-${tiempo.getFullYear()}`).set(this.pushGananciasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-Marzo-${tiempo.getFullYear()}`).set(this.pushGananciasDiarias);
        });
    } else if ((tiempo.getDate() === 30) || (tiempo.getDate() === 31)) {

      // para las ventas
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-${this.meses[tiempo.getMonth() + 1]}-${tiempo.getFullYear()}`).set(this.pushVentasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-${this.meses[tiempo.getMonth() + 1]}-${tiempo.getFullYear()}`).set(this.pushVentasDiarias);
        });

      // para las ganancias
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-${this.meses[tiempo.getMonth() + 1]}-${tiempo.getFullYear()}`).set(this.pushGananciasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/1-${this.meses[tiempo.getMonth() + 1]}-${tiempo.getFullYear()}`).set(this.pushGananciasDiarias);
        });
    } else {

      // para las ventas
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/${tiempo.getDate() + 1}-${this.servicio.meses[tiempo.getMonth()]}-${this.servicio.extraerAno()}`).set(this.pushVentasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ventas/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/${tiempo.getDate() + 1}-${this.servicio.meses[tiempo.getMonth()]}-${this.servicio.extraerAno()}`).set(this.pushVentasDiarias);
        });

      // para las ganancias
      // tslint:disable-next-line:max-line-length
      this.fs.doc<VentasDiarias>(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/${tiempo.getDate() + 1}-${this.servicio.meses[tiempo.getMonth()]}-${this.servicio.extraerAno()}`).set(this.pushGananciasDiarias)
        .then(res => {
          // tslint:disable-next-line:max-line-length
          this.db.database.ref(`/AC Celulares/Control/Ganancias/${this.servicio.tienda}/Diarias/${this.servicio.extraerAno()}/Datos/${tiempo.getDate() + 1}-${this.servicio.meses[tiempo.getMonth()]}-${this.servicio.extraerAno()}`).set(this.pushGananciasDiarias);
        });
    }

  }

  // funcion para extraer la fecha y la hora a cada segundo
  extraerFechaHora() {
    setInterval(() => {
      const fechaHora = new Date();
      if ((fechaHora.getHours() >= 0) && (fechaHora.getHours() <= 12)) {
        // tslint:disable-next-line:max-line-length
        this.fechaHora = `${this.diasSemana[fechaHora.getDay()]} ${fechaHora.getDate()} de ${this.meses[fechaHora.getMonth()]} del ${fechaHora.getFullYear()} | ${fechaHora.getHours()}:${fechaHora.getMinutes()}:${fechaHora.getSeconds()} AM`;
      } else if (fechaHora.getHours() > 12) {
        // tslint:disable-next-line:max-line-length
        this.fechaHora = `${this.diasSemana[fechaHora.getDay()]} ${fechaHora.getDate()} de ${this.meses[fechaHora.getMonth()]} del ${fechaHora.getFullYear()} | ${fechaHora.getHours() - 12}:${fechaHora.getMinutes()}:${fechaHora.getSeconds()} PM`;
      }
    }, 1000);
  }

  // funcion para generar el grafico de la semana actual para las ventas
  generarGraficoVentasSemana() {
    this.graficoVentasSemanaChart = new Chart(this.graficoVentasSemanaCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        datasets: [
          {
            label: 'Accesorios',
            data: this.datosVentasSemanaLocal.Accesorios,
            // data: this.pushVentasSemana.Accesorios,
            backgroundColor: '#007bff'
          },
          {
            label: 'Repuestos',
            data: this.datosVentasSemanaLocal.Repuestos,
            // data: this.pushVentasSemana.Repuestos,
            backgroundColor: '#28a745'
          },
          {
            label: 'Celulares',
            data: this.datosVentasSemanaLocal.Celulares,
            // data: this.pushVentasSemana.Celulares,
            backgroundColor: '#17a2b8'
          },
          {
            label: 'Servicio',
            data: this.datosVentasSemanaLocal.Servicio,
            // data: this.pushVentasSemana.Servicio,
            backgroundColor: '#ffc107'
          },
          {
            label: 'Herramientas',
            data: this.datosVentasSemanaLocal.Herramientas,
            // data: this.pushVentasSemana.Herramientas,
            backgroundColor: '#dc3545'
          }
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  // funcion para generar el grafico anual actual para las ventas
  generarGraficoVentasAnual() {
    this.graficoVentasAnualChart = new Chart(this.graficoVentasAnualCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ],
        datasets: [
          {
            label: 'Accesorios',
            data: this.datosVentasAnualesLocal.Accesorios,
            borderColor: '#007bff',
            fill: false
          },
          {
            label: 'Repuestos',
            data: this.datosVentasAnualesLocal.Repuestos,
            borderColor: '#28a745',
            fill: false
          },
          {
            label: 'Celulares',
            data: this.datosVentasAnualesLocal.Celulares,
            borderColor: '#17a2b8',
            fill: false
          },
          {
            label: 'Servicio',
            data: this.datosVentasAnualesLocal.Servicio,
            borderColor: '#ffc107',
            fill: false
          },
          {
            label: 'Herramientas',
            data: this.datosVentasAnualesLocal.Herramientas,
            borderColor: '#dc3545',
            fill: false
          }
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  // funcion para generar el grafico del dia actual para las ventas
  generarGraficoVentasDiario() {
    this.graficoVentasDiaChart = new Chart(this.graficoVentasDiaCanvas.nativeElement, {

      type: 'doughnut',
      data: {
        labels: [
          'Accesorios',
          'Repuestos',
          'Celulares',
          'Servicio',
          'Herramientas'
        ],
        datasets: [{
          data: this.datosVentasDiarioLocal,
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#17a2b8',
            '#ffc107',
            '#dc3545'
          ],
          hoverBackgroundColor: [
            '#007bff',
            '#28a745',
            '#17a2b8',
            '#ffc107',
            '#dc3545'
          ]
        }
        ]
      }
    });
  }

  // funcion para generar el grafico de la semana actual para las ganancias
  generarGraficoGananciasSemana() {
    this.graficoGananciasSemanaChart = new Chart(this.graficoGananciasSemanaCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        datasets: [
          {
            label: 'Accesorios',
            data: this.datosGananciasSemanaLocal.Accesorios,
            // data: this.pushVentasSemana.Accesorios,
            backgroundColor: '#007bff'
          },
          {
            label: 'Repuestos',
            data: this.datosGananciasSemanaLocal.Repuestos,
            // data: this.pushVentasSemana.Repuestos,
            backgroundColor: '#28a745'
          },
          {
            label: 'Celulares',
            data: this.datosGananciasSemanaLocal.Celulares,
            // data: this.pushVentasSemana.Celulares,
            backgroundColor: '#17a2b8'
          },
          {
            label: 'Servicio',
            data: this.datosGananciasSemanaLocal.Servicio,
            // data: this.pushVentasSemana.Servicio,
            backgroundColor: '#ffc107'
          },
          {
            label: 'Herramientas',
            data: this.datosGananciasSemanaLocal.Herramientas,
            // data: this.pushVentasSemana.Herramientas,
            backgroundColor: '#dc3545'
          }
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  // funcion para generar el grafico anual actual para las ganancias
  generarGraficoGananciasAnual() {
    this.graficoGananciasAnualChart = new Chart(this.graficoGananciasAnualCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: [
          'Enero',
          'Febrero',
          'Marzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ],
        datasets: [
          {
            label: 'Accesorios',
            data: this.datosGananciasAnualesLocal.Accesorios,
            borderColor: '#007bff',
            fill: false
          },
          {
            label: 'Repuestos',
            data: this.datosGananciasAnualesLocal.Repuestos,
            borderColor: '#28a745',
            fill: false
          },
          {
            label: 'Celulares',
            data: this.datosGananciasAnualesLocal.Celulares,
            borderColor: '#17a2b8',
            fill: false
          },
          {
            label: 'Servicio',
            data: this.datosGananciasAnualesLocal.Servicio,
            borderColor: '#ffc107',
            fill: false
          },
          {
            label: 'Herramientas',
            data: this.datosGananciasAnualesLocal.Herramientas,
            borderColor: '#dc3545',
            fill: false
          }
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  // funcion para generar el grafico del dia actual para las ganancias
  generarGraficoGananciasDiario() {
    this.graficoGananciasDiaChart = new Chart(this.graficoGananciasDiaCanvas.nativeElement, {

      type: 'doughnut',
      data: {
        labels: [
          'Accesorios',
          'Repuestos',
          'Celulares',
          'Servicio',
          'Herramientas'
        ],
        datasets: [{
          data: this.datosGananciasDiarioLocal,
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#17a2b8',
            '#ffc107',
            '#dc3545'
          ],
          hoverBackgroundColor: [
            '#007bff',
            '#28a745',
            '#17a2b8',
            '#ffc107',
            '#dc3545'
          ]
        }
        ]
      }
    });
  }
}
