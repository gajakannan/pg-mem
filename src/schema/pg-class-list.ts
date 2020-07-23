import { _ITable, _ISelection, IValue, _IIndex, _IDb, IndexKey, setId } from '../interfaces-private';
import { Selection } from '../transforms/selection';
import { ReadOnlyError, NotSupported } from '../interfaces';
import { Types, makeArray } from '../datatypes';
import { MAIN_NAMESPACE, SCHEMA_NAMESPACE, parseOid } from './consts';
import { MemoryTable } from '../table';
import { CustomIndex } from './custom-index';

// https://www.postgresql.org/docs/12/catalog-pg-class.html

const IS_SCHEMA = Symbol('_is_pg_classlist');
export class PgClassListTable implements _ITable {

    hidden = true;

    get ownSymbol() {
        return IS_SCHEMA;
    }

    get name() {
        return 'pg_class';
    }

    selection: _ISelection<any> = new Selection(this, {
        schema: {
            name: 'pg_class',
            fields: [
                { id: 'oid', type: Types.int } // hidden oid column
                , { id: 'relname', type: Types.text() }
                , { id: 'relnamespace', type: Types.int } // oid
                , { id: 'reltype', type: Types.int } // oid
                , { id: 'reloftype', type: Types.int } // oid
                , { id: 'relowner', type: Types.int } // oid
                , { id: 'relam', type: Types.int } // oid
                , { id: 'relfilenode', type: Types.int } // oid
                , { id: 'reltablespace', type: Types.int } // oid
                , { id: 'relpages', type: Types.int }
                , { id: 'reltyples', type: Types.int }
                , { id: 'relallvisible', type: Types.int }
                , { id: 'reltoastrelid', type: Types.int }
                , { id: 'relhashindex', type: Types.bool }
                , { id: 'relisshared', type: Types.bool }
                , { id: 'relpersistence', type: Types.text(1) } // char(1)
                , { id: 'relkind', type: Types.text(1) } // char(1)
                , { id: 'relnatts', type: Types.int }
                , { id: 'relchecks', type: Types.int }
                , { id: 'relhasoids', type: Types.bool }
                , { id: 'relhasrules', type: Types.bool }
                , { id: 'relhastriggers', type: Types.bool }
                , { id: 'relhassubclass', type: Types.bool }
                , { id: 'relrowsecurity', type: Types.bool }
                , { id: 'relforcerowsecurity', type: Types.bool }
                , { id: 'relispopulated', type: Types.bool }
                , { id: 'relreplident', type: Types.text(1) } // char(1)
                , { id: 'relispartition', type: Types.bool }
                , { id: 'relrewrite', type: Types.int } // oid
                , { id: 'relfrozenxid', type: Types.int } // xid
                , { id: 'relminmxid', type: Types.int } // xid
                , { id: 'relacl', type: Types.text() } // alitem[]
                , { id: 'reloptions', type: makeArray(Types.text()) } // text[]
                , { id: 'relpartbound', type: Types.jsonb } // pg_nod_tr
            ]
        }
    });

    private indexes: { [key: string]: _IIndex } = {
        'oid': new CustomIndex(this, {
            get size() {
                return this.size
            },
            column: this.selection.getColumn('oid'),
            byColumnValue: (oid: string) => {
                return [this.byOid(oid)]
            }
        }),
        'relname': new CustomIndex(this, {
            get size() {
                return this.size
            },
            column: this.selection.getColumn('relname'),
            byColumnValue: (oid: string) => {
                return [this.byRelName(oid)];
            }
        }),
    }


    constructor(readonly db: _IDb) {
    }

    private byOid(oid: string) {
        const { type, id } = parseOid(oid);
        switch (type) {
            case 'table':
                return this.makeTable(this.db.getTable(id, true));
            case 'index':
                return null;
            // return this.makeTable(this.db.getIndex(id, true));
            default:
                throw NotSupported.never(type);
        }
    }

    private byRelName(name: string) {
        return this.db.getTable(name, true);
        // ?? this.db.getIndex(name, true);
    }

    insert(toInsert: any): void {
        throw new ReadOnlyError('information schema');
    }
    createIndex(): this {
        throw new ReadOnlyError('information schema');
    }

    setReadonly(): this {
        throw new ReadOnlyError('information schema');
    }

    get entropy(): number {
        return this.db.tablesCount;
    }

    *enumerate() {
        // for (const t of this.db.listTables()) {
        //     yield this.makeTable(t);
        // }
    }


    makeInedx(t: _IIndex<any>): any {
        if (!t) {
            return null;
        }
        // relkind , i = index, S = sequence, t = TOAST table, v = view, m = materialized view, c = composite type, f = foreign table, p = partitioned table, I = partitioned index
        throw new Error('todo');
    }
    makeTable(t: _ITable<any>): any {
        if (!t) {
            return null;
        }
        throw new Error('todo');
        const ret = {
            relname: t.name,
            relnamespace: t instanceof MemoryTable
                ? MAIN_NAMESPACE
                : SCHEMA_NAMESPACE,
            relkind: 'r', //  r = ordinary table
            [IS_SCHEMA]: true,
        };
        return setId(ret, '/schema/pg_class/table/' + t.name);
    }

    hasItem(value: any): boolean {
        return !!value?.[IS_SCHEMA];
    }

    getIndex(forValue: IValue<any>): _IIndex<any> {
        switch (forValue.id) {
            case 'oid':
        }
        // if (forValue.id === 'relname') {
        //     return new TableIndex(this, forValue);
        // }
        return null;
    }

    on(): void {
        throw new NotSupported('subscribing information schema');
    }

}