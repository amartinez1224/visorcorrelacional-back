import pandas as pd
import json

def extractData(file, segments, firstYear, names, sheets):
    '''Lee un archivo Excel y devuelve un diccionario que representa los datos del archivo.'''
    
    result = {}
    with pd.ExcelFile(file, engine='openpyxl') as excel:
        i = 1
        for sheet in sheets:
            s = pd.read_excel(excel, sheet_name=sheet, index_col=None, header=None, skiprows=2, dtype={0:'string'})
            s.set_index(0, inplace=True)
            for index, row in s.iterrows():
                if not index in result:
                    result[index] = {}
                for column in s.columns:
                    if column >= 3:
                        caption = names[(column-3)%segments]
                        if sheet != 'Variable':
                            caption = caption+'_'+sheet.lower()
                        year = ((column-3)//segments)+firstYear
                        if year not in result[index]:
                            result[index][year] = {'id':i, 'divipola':index, 'department':row[1], 'municipality':row[2], 'anio':year, 'divipola_anio':index+str(year)}
                            i+=1
                        try:
                            result[index][year][caption] = float(row[column])
                            if result[index][year][caption] != result[index][year][caption]:
                                result[index][year][caption] = None
                        except:
                            result[index][year][caption] = None

    return result

def saveJsonForArcGIS(data, file):
    '''Guarda los datos en un archivo GeoJSON para ser cargado en ArcGIS.'''
    
    features = [{'type': 'Feature','id': data[div][year]['id'],'geometry': None,'properties':data[div][year]} for div in data for year in data[div]]
    print(file,len(features))
    newData = {'type': 'FeatureCollection','crs': {'type': 'name','properties': {'name': 'EPSG:4326'}},'features':features}
    with open(file, 'w', encoding='utf8') as f:
        json.dump(newData, f, indent=4, ensure_ascii=False)
        
def saveJson(data, file):
    '''Guarda los datos en un archivo JSON.'''
    
    features = [{'attributes':data[div][year]} for div in data for year in data[div]]
    with open(file, 'w', encoding='utf8') as f:
        json.dump(features, f, indent=4, ensure_ascii=False)
        
def saveYearlyJson(data, file):
    '''Guarda los datos en archivos JSON por años.'''
    
    featuresY = {}
    for div in data:   
        for year in data[div]:
            if year in featuresY:
                featuresY[year].append(data[div][year])
            else:
                featuresY[year] = [data[div][year]]
    a,b = file.split('.')
    for year, features in featuresY.items():
        newData = {'features':features}
        with open(a+'_'+str(year)+'.'+b, 'w', encoding='utf8') as f:
            json.dump(newData, f, indent=4, ensure_ascii=False)
        
def saveExcel(data, file):
    '''Guarda los datos en un archivo Excel.'''
    
    features = [data[div][year] for div in data for year in data[div]]
    df = pd.DataFrame(features)
    print(df)
    df.to_excel(file, index=False)

def divideData(data):
    '''Divide los datos en tres diccionarios, uno para los datos de los municipios, otro para las regiones PDET y otro para los datos de los departamentos.'''
    
    pdetDiv = ['0'+str(i) for i in range(2000,2017)]
    pdetDiv.append('00000')
    deptDiv = ['05000', '08000', '11000', '13000', '15000', '17000', '18000', '19000', '20000', '23000', '25000', '27000', '41000', '44000', '47000', '50000', '52000', '54000', '63000', '66000', '68000', '70000', '73000', '76000', '81000', '85000', '86000', '88000', '91000', '94000', '95000', '97000', '99000']
    dept = {k:data.pop(k) for k in list(data) if k in deptDiv}
    pdet = {k:data.pop(k) for k in list(data) if k in pdetDiv}
    return dept, data, pdet

if __name__ == '__main__':
    '''Ejemplo para transformar los datos de Razon de mortalidad materna'''
    
    sheets = ['Variable','Indigena','NARP','Ninguno','Urbano','Rural','50_54_anios','45_49_anios','40_44_anios','35_39_anios','30_34_anios','25_29_anios','20_24_anios','15_19_anios','10_14_anios','sin_informacion'] # 'Masculino','Femenino','Otro','Edad_quinquenal'
    r = extractData('BDI_RMM_2_1.xlsx', 3, 2005, ['maternal_deaths', 'live_births', 'rate_cienmilhab'], sheets)
    dept, mun, pdet = divideData(r)

   
    saveJson(dept, 'RMMdept.geojson')
    saveJson(mun, 'RMMmun.geojson')
    saveJson(pdet, 'RMMpdet.geojson')
    saveExcel(pdet, 'RMMpdet.xlsx')
    #saveYearlyJson(pdet, 'yearly/BD_16_RMM_pdet.json')
    #saveYearlyJson(mun, 'yearly/BD_16_RMM_mun.json')
    #saveYearlyJson(dept, 'yearly/BD_16_RMM_dept.json')
    


   