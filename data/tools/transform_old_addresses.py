from json import dump, load
from os import path

def read_addresses(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = load(f)
        return data

def segment_databases(data):
    databases = {}
    for entry in data['direcciones']:
        db = entry['n']
        dblist = databases.setdefault(db, {})
        dblist[entry['l']] = entry
    return databases

def last_number(text):
    last = "0"
    try:
        last = text.split('/')[-2]
    except:
        print('Error feature_server: {}'.format(text))
    return last

def databases_new_format(databases):
    variables = []
    for db in databases:
        variable = {}
        variable['base_de_datos'] = db
        variable['feature_servers'] = {
            'departamentos': last_number(databases[db]['dept']['a']),
            'municipios': last_number(databases[db]['mun']['a']),
            'PDET': last_number(databases[db]['PDET']['a']),
            }
        variable['variables'] = databases[db]['dept']['fields']
        for var in variable['variables']:
            var['nombre'] = var.pop('name', None)
            var['limites'] = var.pop('limits', None)
            var['rango'] = var.pop('range', None)
            var['unidad'] = var.pop('unit', None)
            var['anios'] = databases[db]['dept']['years']
        variables.append(variable)
    return variables
    
def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        dump(data, f, ensure_ascii=False, indent=4)
  
if __name__ == '__main__':
    basepath = path.dirname(path.realpath(__file__))
    data = read_addresses(path.join(basepath, '..', 'addresses.json'))
    dbs = segment_databases(data)
    variables = databases_new_format(dbs)
    save_json(variables, path.join(basepath, '..', 'variables.json'))  