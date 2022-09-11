from csv import DictReader
from json import dump
from os import path

def read_csv(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        reader = DictReader(f)
        reader.fieldnames = ['divipola_departamento', 'divipola', 'nombre_departamento', 'nombre', 'tipo']
        data = list(reader)[1:]
        return data

def standarize(data):
    for d in data:
        d['nombre_departamento'] = d['nombre_departamento'].title()
        d['nombre'] = d['nombre'].title()

def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        dump(data, f, ensure_ascii=False, indent=4)
  
if __name__ == '__main__':
    basepath = path.dirname(path.realpath(__file__))
    data = read_csv(path.join(basepath, '..', 'DIVIPOLA_municipios.csv'))
    standarize(data)
    save_json(data, path.join(basepath, '..', 'municipios.json'))  
    