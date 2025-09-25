import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_ADMIN;

  constructor() { }

  getInversoresList(){
    return this.http.get(this.baseUrl+this.baseComponent+'getInversoresList');
  }

  getInversionesList(idInversor: number){
    const params = new HttpParams()
        .set('idInversor', Number(idInversor));
    return this.http.get(this.baseUrl+this.baseComponent+'getInversionesList', {params});
  }

  deleteInversion(codOperacion: string){
    let data = codOperacion.replace("SS-","");
    return this.http.delete(this.baseUrl+this.baseComponent+'inversion/'+data);
  }

  getInversorDetail(idInversor: number){
    const params = new HttpParams()
        .set('idInversor', Number(idInversor));
    return this.http.get(this.baseUrl+this.baseComponent+'getInversorDetail', {params});
  }


  updateAccesoUsuario(idUsuario: number, acceso: boolean){
      const request = {acceso: acceso};
      return this.http.patch(this.baseUrl+this.baseComponent+idUsuario+'/usuario-acceso', request);
  }

  updateMembresia(idMembresia: number, request: boolean){
      return this.http.put(this.baseUrl+this.baseComponent+idMembresia+'/update-membresia', request);
  }

  dashboard(){
      return this.http.get(this.baseUrl+this.baseComponent+'dashboard');
  }
  
  /* CREAR CODIGO UNICO */
    buscarCliente(tipoDocumento: string, nroDocumento: string){
    const params = new HttpParams()
			.set('tipoDocumento', tipoDocumento).set('nroDocumento', nroDocumento);
    return this.http.get(this.baseUrl+this.baseComponent+'buscar-cliente', {params});
  }

  correoExistente(correo: string){
    const params = new HttpParams()
			.set('correo', correo);
    return this.http.get(this.baseUrl+this.baseComponent+'consultar-correo', {params});
  }

  crearCodigoUnico(obj: any){
      return this.http.post(this.baseUrl+this.baseComponent+'crear-codigo-unico',obj);
  }

}
