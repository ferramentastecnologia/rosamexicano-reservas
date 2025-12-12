'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, Users } from 'lucide-react';
import { TableArea, AREA_NAMES, canTablesBeJoined, canTableBeCombined } from '@/lib/tables-config';

type Mesa = {
  number: number;
  available: boolean;
  capacity: number;
  area: TableArea;
};

// Função auxiliar para calcular capacidade total das mesas selecionadas
const calculateTotalCapacity = (tableNumbers: number[], allTables: Mesa[]): number => {
  return tableNumbers.reduce((total, tableNum) => {
    const table = allTables.find(t => t.number === tableNum);
    return total + (table?.capacity || 0);
  }, 0);
};

type MapaMesasProps = {
  data: string;
  horario: string;
  numeroPessoas: number;
  selectedArea: TableArea | null;
  onMesasSelect: (mesas: number[]) => void;
};

// Cache local para evitar requisições repetidas
const tablesCache = new Map<string, { tables: Mesa[]; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos

export default function MapaMesas({ data, horario, numeroPessoas, selectedArea, onMesasSelect }: MapaMesasProps) {
  const [tables, setTables] = useState<Mesa[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadAvailableTables = useCallback(async () => {
    if (!selectedArea || !data) return;

    // Verificar cache local
    const cacheKey = `${data}-${selectedArea}`;
    const cached = tablesCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      setTables(cached.tables);
      return;
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await fetch('/api/get-available-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, area: selectedArea }),
        signal: abortControllerRef.current.signal,
      });

      const result = await response.json();

      if (result.tables) {
        setTables(result.tables);
        // Salvar no cache
        tablesCache.set(cacheKey, { tables: result.tables, timestamp: Date.now() });
      } else {
        setTables([]);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao carregar mesas:', error);
        setTables([]);
      }
    } finally {
      setLoading(false);
    }
  }, [data, selectedArea]);

  useEffect(() => {
    if (data && selectedArea) {
      loadAvailableTables();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [data, selectedArea, loadAvailableTables]);

  useEffect(() => {
    if (numeroPessoas > 0) {
      setSelectedTables([]);
    }
  }, [numeroPessoas]);

  useEffect(() => {
    setSelectedTables([]);
    onMesasSelect([]);
  }, [selectedArea]);

  const toggleTable = (tableNumber: number) => {
    const table = tables.find(t => t.number === tableNumber);
    if (!table || !table.available) return;

    setSelectedTables(prev => {
      const isSelected = prev.includes(tableNumber);

      if (isSelected) {
        const newSelection = prev.filter(num => num !== tableNumber);
        onMesasSelect(newSelection);
        setAlertMessage('');
        return newSelection;
      } else {
        // Calcular capacidade total após adicionar esta mesa
        const newSelection = [...prev, tableNumber];
        const totalCapacity = calculateTotalCapacity(newSelection, tables);

        // Validar se não ultrapassa o número de pessoas
        if (totalCapacity >= numeroPessoas) {
          // Validação de combinação de mesas
          // Mostrar alerta se a mesa não pode ser combinada
          if (!canTableBeCombined(tableNumber)) {
            let mensagem = `⚠️ Mesa ${tableNumber} não pode ser combinada com outras mesas\n`;
            mensagem += `Mesas com restrição: 1-8, 10, 11, 12`;
            setAlertMessage(mensagem);
          } else {
            // Validar se pode combinar com as mesas já selecionadas
            for (const selectedTable of prev) {
              if (!canTablesBeJoined(tableNumber, selectedTable)) {
                let mensagem = `⚠️ Mesa ${tableNumber} não pode combinar com mesa ${selectedTable}\n`;
                mensagem += `Combinações permitidas: 14+16 (vinculadas) ou demais mesas`;
                setAlertMessage(mensagem);
              }
            }
          }

          onMesasSelect(newSelection.sort((a, b) => a - b));
          return newSelection.sort((a, b) => a - b);
        }
        return prev;
      }
    });
  };

  const pessoasValidas = numeroPessoas && !isNaN(numeroPessoas) && numeroPessoas > 0;
  const capacidadeTotal = pessoasValidas ? calculateTotalCapacity(selectedTables, tables) : 0;
  const selecaoCompleta = pessoasValidas && capacidadeTotal >= numeroPessoas && selectedTables.length > 0;

  if (!data || !horario) {
    return (
      <div className="bg-black/20 rounded-xl p-8 border border-white/5 text-center">
        <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">
          Selecione a <span className="text-[#f98f21]">data</span> e o <span className="text-[#f98f21]">horário</span> para ver as mesas
        </p>
      </div>
    );
  }

  if (!pessoasValidas) {
    return (
      <div className="bg-black/20 rounded-xl p-8 border border-white/5 text-center">
        <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">
          Informe o <span className="text-[#f98f21]">número de pessoas</span> para selecionar mesas
        </p>
      </div>
    );
  }

  if (!selectedArea) {
    return (
      <div className="bg-black/20 rounded-xl p-8 border border-white/5 text-center">
        <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">
          Selecione a <span className="text-[#f98f21]">área do restaurante</span> para ver as mesas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/20 rounded-xl p-4 md:p-6 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium flex items-center gap-2 text-white/90">
          <Users className="w-4 h-4 text-[#f98f21]" />
          Mesas - {AREA_NAMES[selectedArea]}
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40">Capacidade:</span>
          <span className={`font-bold ${selecaoCompleta ? 'text-[#25bcc0]' : 'text-[#ffc95b]'}`}>
            {capacidadeTotal}/{numeroPessoas} lugares
          </span>
        </div>
      </div>

      {/* Status da Seleção */}
      {selectedTables.length > 0 && (
        <div className={`mb-4 p-3 rounded-lg border ${
          selecaoCompleta
            ? 'bg-[#25bcc0]/10 border-[#25bcc0]/30'
            : 'bg-[#ffc95b]/10 border-[#ffc95b]/30'
        }`}>
          <p className={`text-xs font-medium ${selecaoCompleta ? 'text-[#25bcc0]' : 'text-[#ffc95b]'}`}>
            {selecaoCompleta ? (
              <>
                <Check className="w-3.5 h-3.5 inline mr-1" />
                Seleção completa! Mesas: {selectedTables.join(', ')} ({capacidadeTotal} lugares)
              </>
            ) : (
              <>Faltam {numeroPessoas - capacidadeTotal} lugar(es). Mesas: {selectedTables.join(', ')}</>
            )}
          </p>
        </div>
      )}

      {alertMessage && (
        <div className="mb-4 p-3 rounded-lg border bg-amber-950/30 border-amber-600/40">
          <p className="text-xs font-medium text-amber-200 whitespace-pre-line">
            {alertMessage}
          </p>
        </div>
      )}

      {/* Grid de Mesas */}
      {loading ? (
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : tables.length > 0 ? (
        <>
          <div className="mb-3 text-xs text-white/40">
            {tables.filter(t => t.available).length} mesas disponíveis • Clique para selecionar
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
            {tables.map(table => {
              const isSelected = selectedTables.includes(table.number);
              const isAvailable = table.available;

              return (
                <button
                  key={table.number}
                  type="button"
                  onClick={() => toggleTable(table.number)}
                  disabled={!isAvailable}
                  className={`
                    aspect-square rounded-lg border flex flex-col items-center justify-center
                    transition-all duration-200 relative
                    ${isSelected
                      ? 'bg-[#d71919] border-transparent text-white scale-105 shadow-lg shadow-[#d71919]/30'
                      : isAvailable
                        ? 'bg-white/5 border-white/10 text-white/70 hover:border-[#f98f21]/50 hover:bg-white/10 hover:scale-105'
                        : 'bg-black/30 border-white/5 text-white/20 cursor-not-allowed'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#25bcc0] rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-bold">{table.number}</span>
                  <span className="text-[9px]">
                    {isAvailable ? `${table.capacity}p` : <X className="w-3 h-3" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legenda */}
          <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-white/40 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-white/5 border border-white/10 rounded"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#d71919] rounded"></div>
              <span>Selecionada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-black/30 border border-white/5 rounded"></div>
              <span>Ocupada</span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-white/40">
          <p className="text-sm">Nenhuma mesa disponível nesta área</p>
        </div>
      )}
    </div>
  );
}
