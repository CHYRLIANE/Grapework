import { LocalStorageService } from '../app.js';
import { NotificationService } from '../services/notifications.service.js';

export function renderDashboard(container) {
    const funcionarios = LocalStorageService.getData('funcionarios') || [];
    const eventos = LocalStorageService.getData('eventos') || [];
    const bancoHoras = LocalStorageService.getData('banco_horas') || [];
    const salarios = LocalStorageService.getData('salarios') || [];

    // New helper functions
    function getAniversariantesDoMes() {
        const currentMonth = new Date().getMonth();
        return funcionarios.filter(func => {
            if (!func.dataNascimento) return false;
            const birthMonth = new Date(func.dataNascimento).getMonth();
            return birthMonth === currentMonth;
        });
    }

    function getFuncionariosEmFerias() {
        const today = new Date();
        return funcionarios.filter(func => {
            if (!func.dataInicioFerias) return false;
            const inicioFerias = new Date(func.dataInicioFerias);
            const fimFerias = new Date(inicioFerias);
            fimFerias.setDate(fimFerias.getDate() + 30); // Assuming 30 days vacation
            return today >= inicioFerias && today <= fimFerias;
        });
    }

    container.innerHTML = `
        <div class="container-fluid">
            <h1 class="mt-4">Dashboard - GrapeWork</h1>
            
            <!-- Filtros -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5>Filtros</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <label>Período</label>
                            <select class="form-control" id="periodFilter">
                                <option value="month">Último Mês</option>
                                <option value="quarter">Último Trimestre</option>
                                <option value="year">Último Ano</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label>Funcionário</label>
                            <select class="form-control" id="employeeFilter">
                                <option value="">Todos os Funcionários</option>
                                ${funcionarios.map(func => 
                                    `<option value="${func.nome}">${func.nome}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label>Tipo de Evento</label>
                            <select class="form-control" id="eventTypeFilter">
                                <option value="">Todos</option>
                                <option value="falta">Faltas</option>
                                <option value="advertencia">Advertências</option>
                                <option value="suspensao">Suspensões</option>
                                <option value="atraso">Atrasos</option>
                                <option value="atestado">Atestados</option>
                            </select>
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button class="btn btn-primary w-100" id="applyFilters">
                                <i class="bi bi-filter"></i> Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- First Row: People Metrics -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-light h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-people-fill fs-1 text-primary mb-2"></i>
                            <h5 class="card-title">Total de Funcionários</h5>
                            <h2 id="totalEmployees" class="mb-0">${funcionarios.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-currency-dollar fs-1 text-success mb-2"></i>
                            <h5 class="card-title">Média Salarial</h5>
                            <h2 id="mediaSalarial" class="mb-0">${calcularMediaSalarial(salarios)}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light h-100 cursor-pointer" data-bs-toggle="modal" data-bs-target="#aniversariantesModal">
                        <div class="card-body text-center">
                            <i class="bi bi-gift-fill fs-1 text-warning mb-2"></i>
                            <h5 class="card-title">Aniversariantes do Mês</h5>
                            <h2 id="totalAniversariantes" class="mb-0">${getAniversariantesDoMes().length}</h2>
                            <small class="text-muted">Clique para detalhes</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light h-100 cursor-pointer" data-bs-toggle="modal" data-bs-target="#feriasModal">
                        <div class="card-body text-center">
                            <i class="bi bi-sun-fill fs-1 text-danger mb-2"></i>
                            <h5 class="card-title">Funcionários em Férias</h5>
                            <h2 id="totalFerias" class="mb-0">${getFuncionariosEmFerias().length}</h2>
                            <small class="text-muted">Clique para detalhes</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Second Row: Event Metrics -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card bg-light h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-calendar2-event fs-1 text-info mb-2"></i>
                            <h5 class="card-title">Total de Eventos</h5>
                            <h2 id="totalEvents" class="mb-0">${eventos.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-graph-up fs-1 text-purple mb-2"></i>
                            <h5 class="card-title">Média Eventos/Funcionário</h5>
                            <h2 id="avgEventsPerEmployee" class="mb-0">
                                ${(eventos.length / (funcionarios.length || 1)).toFixed(1)}
                            </h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light h-100">
                        <div class="card-body text-center">
                            <i class="bi bi-clock-history fs-1 text-secondary mb-2"></i>
                            <h5 class="card-title">Saldo Total Banco de Horas</h5>
                            <h2 id="totalBancoHoras" class="mb-0">Carregando...</h2>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="mb-0"><i class="bi bi-pie-chart me-2"></i>Distribuição de Eventos</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="eventsPieChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Evolução de Eventos</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="eventsLineChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="mb-0"><i class="bi bi-building me-2"></i>Eventos por Setor</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="sectorChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="mb-0"><i class="bi bi-trophy me-2"></i>Ranking de Funcionários</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped" id="employeeRankingTable">
                                    <thead>
                                        <tr>
                                            <th>Funcionário</th>
                                            <th>Setor</th>
                                            <th>Total Eventos</th>
                                            <th>Último Evento</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alertas -->
            <div class="card mb-4" id="alertsCard">
                <div class="card-header bg-warning text-dark">
                    <h5><i class="bi bi-exclamation-triangle"></i> Alertas</h5>
                </div>
                <div class="card-body" id="alertsContainer"></div>
            </div>
        </div>

        <!-- Modal Aniversariantes -->
        <div class="modal fade" id="aniversariantesModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Aniversariantes do Mês</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="list-group">
                            ${getAniversariantesDoMes().map(func => `
                                <li class="list-group-item">
                                    ${func.nome} - ${new Date(func.dataNascimento).toLocaleDateString()}
                                </li>
                            `).join('')}
                        </ul>
                        ${getAniversariantesDoMes().length === 0 ? 
                            '<p class="text-muted text-center">Nenhum aniversariante este mês</p>' : ''}
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Férias -->
        <div class="modal fade" id="feriasModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Funcionários em Férias</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="list-group">
                            ${getFuncionariosEmFerias().map(func => `
                                <li class="list-group-item">
                                    ${func.nome} - Início: ${new Date(func.dataInicioFerias).toLocaleDateString()}
                                </li>
                            `).join('')}
                        </ul>
                        ${getFuncionariosEmFerias().length === 0 ? 
                            '<p class="text-muted text-center">Nenhum funcionário em férias</p>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Helper function to calculate total hours
    function calculateTotalHours(bancoHorasData, employeeName = null, period = null) {
        let filteredData = bancoHorasData;

        // Filter by employee if specified
        if (employeeName) {
            filteredData = filteredData.filter(entry => 
                entry.funcionario === employeeName
            );
        }

        // Filter by period if specified
        if (period) {
            const currentDate = new Date();
            const cutoffDate = new Date();

            switch(period) {
                case 'month':
                    cutoffDate.setMonth(currentDate.getMonth() - 1);
                    break;
                case 'quarter':
                    cutoffDate.setMonth(currentDate.getMonth() - 3);
                    break;
                case 'year':
                    cutoffDate.setFullYear(currentDate.getFullYear() - 1);
                    break;
            }

            filteredData = filteredData.filter(entry => 
                new Date(entry.dataFinal || entry.data) >= cutoffDate
            );
        }

        // Calculate total hours
        const totalHoras = filteredData.reduce((sum, entry) => {
            const hourValue = convertTimeToHours(entry.saldo || entry.saldoPeriodo);
            return sum + hourValue;
        }, 0);

        return totalHoras;
    }

    function filterData() {
        const period = document.getElementById('periodFilter').value;
        const employeeName = document.getElementById('employeeFilter').value;
        const eventType = document.getElementById('eventTypeFilter').value;

        let filteredEvents = [...eventos];
        const currentDate = new Date();

        // Filtro de período
        if (period) {
            const periodMap = {
                month: 1,
                quarter: 3,
                year: 12
            };
            const months = periodMap[period];
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - months);
            filteredEvents = filteredEvents.filter(e => new Date(e.data) >= cutoffDate);
        }

        // Filtro de funcionário
        if (employeeName) {
            filteredEvents = filteredEvents.filter(e => e.funcionario === employeeName);
        }

        // Filtro de tipo de evento
        if (eventType) {
            filteredEvents = filteredEvents.filter(e => e.tipo === eventType);
        }

        return filteredEvents;
    }

    function updateDashboard() {
        const employeeName = document.getElementById('employeeFilter').value;
        const period = document.getElementById('periodFilter').value;
        const bancoHorasData = LocalStorageService.getData('banco_horas') || [];
        
        // Update Total Banco de Horas
        const totalBancoHoras = calculateTotalHours(bancoHorasData, employeeName, period);
        const totalBancoHorasElement = document.getElementById('totalBancoHoras');
        
        totalBancoHorasElement.textContent = `${totalBancoHoras.toFixed(2)}h`;
        totalBancoHorasElement.classList.add(totalBancoHoras >= 0 ? 'text-success' : 'text-danger');

        // Filtrar eventos
        const filteredEvents = filterData();

        // Atualizar métricas
        document.getElementById('totalEvents').textContent = filteredEvents.length;
        document.getElementById('avgEventsPerEmployee').textContent = 
            (filteredEvents.length / (funcionarios.length || 1)).toFixed(1);
        
        // Atualizar gráfico de pizza
        updatePieChart(filteredEvents);
        
        // Atualizar gráfico de linha
        updateLineChart(filteredEvents);
        
        // Atualizar gráfico de setores
        updateSectorChart(filteredEvents);
        
        // Atualizar ranking de funcionários
        updateEmployeeRanking(filteredEvents);
        
        // Atualizar alertas
        updateAlerts(filteredEvents);
        
        updateSalaryMetrics();
    }

    function updatePieChart(filteredEvents) {
        // Destroy existing chart if it exists
        const existingChart = Chart.getChart('eventsPieChart');
        if (existingChart) {
            existingChart.destroy();
        }

        // Count events by type
        const eventCounts = {};
        filteredEvents.forEach(event => {
            // Ensure we have a valid event type
            if (event.tipo) {
                eventCounts[event.tipo] = (eventCounts[event.tipo] || 0) + 1;
            }
        });

        // Assign colors based on event type
        const colors = {
            'falta': '#FF6384',       // Bright pink for absences
            'advertencia': '#36A2EB', // Bright blue for warnings
            'suspensao': '#FFCE56',   // Bright yellow for suspensions
            'atraso': '#4BC0C0',      // Teal for delays
            'atestado': '#9966FF'     // Purple for medical certificates
        };

        // Create new chart with filtered data
        new Chart(document.getElementById('eventsPieChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(eventCounts),
                datasets: [{
                    data: Object.values(eventCounts),
                    backgroundColor: Object.keys(eventCounts).map(tipo => 
                        colors[tipo] || '#6a0dad' // Default to grape purple if no specific color
                    )
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição de Eventos'
                    }
                }
            }
        });
    }

    function updateLineChart(filteredEvents) {
        const eventsByMonth = {};
        filteredEvents.forEach(event => {
            const month = new Date(event.data).toLocaleString('default', { month: 'short' });
            eventsByMonth[month] = (eventsByMonth[month] || 0) + 1;
        });

        const lineChart = new Chart(document.getElementById('eventsLineChart'), {
            type: 'line',
            data: {
                labels: Object.keys(eventsByMonth),
                datasets: [{
                    label: 'Total de Eventos',
                    data: Object.values(eventsByMonth),
                    borderColor: '#6a0dad',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateSectorChart(filteredEvents) {
        const eventsBySector = {};
        filteredEvents.forEach(event => {
            const funcionario = funcionarios.find(f => f.nome === event.funcionario);
            if (funcionario) {
                eventsBySector[funcionario.setor] = (eventsBySector[funcionario.setor] || 0) + 1;
            }
        });

        const sectorChart = new Chart(document.getElementById('sectorChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(eventsBySector),
                datasets: [{
                    label: 'Eventos por Setor',
                    data: Object.values(eventsBySector),
                    backgroundColor: '#6a0dad'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateEmployeeRanking(filteredEvents) {
        const employeeEvents = {};
        filteredEvents.forEach(event => {
            if (!employeeEvents[event.funcionario]) {
                employeeEvents[event.funcionario] = {
                    count: 0,
                    lastEvent: null,
                    setor: funcionarios.find(f => f.nome === event.funcionario)?.setor || 'N/A'
                };
            }
            employeeEvents[event.funcionario].count++;
            if (!employeeEvents[event.funcionario].lastEvent || 
                new Date(event.data) > new Date(employeeEvents[event.funcionario].lastEvent)) {
                employeeEvents[event.funcionario].lastEvent = event.data;
            }
        });

        const rankingTable = document.getElementById('employeeRankingTable').getElementsByTagName('tbody')[0];
        rankingTable.innerHTML = Object.entries(employeeEvents)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, data]) => `
                <tr>
                    <td>${name}</td>
                    <td>${data.setor}</td>
                    <td>${data.count}</td>
                    <td>${new Date(data.lastEvent).toLocaleDateString()}</td>
                </tr>
            `).join('');
    }

    function updateAlerts(filteredEvents) {
        const alertsContainer = document.getElementById('alertsContainer');
        const alerts = [];

        // Alerta para funcionários com muitos eventos recentes
        const recentEvents = {};
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        filteredEvents.forEach(event => {
            if (new Date(event.data) >= thirtyDaysAgo) {
                recentEvents[event.funcionario] = (recentEvents[event.funcionario] || 0) + 1;
            }
        });

        Object.entries(recentEvents).forEach(([funcionario, count]) => {
            if (count >= 3) {
                alerts.push(`
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle"></i>
                        ${funcionario} registrou ${count} eventos nos últimos 30 dias
                    </div>
                `);
            }
        });

        // Render alerts
        alertsContainer.innerHTML = alerts.length ? alerts.join('') : 
            '<div class="alert alert-success">Nenhum alerta crítico no momento</div>';
    }

    function convertTimeToHours(timeStr) {
        if (!timeStr) return 0;
        
        const isNegative = timeStr.startsWith('-');
        const [hours, minutes] = timeStr.replace(/[+-]/, '').split(':').map(Number);
        const decimalHours = hours + (minutes / 60);
        
        return isNegative ? -decimalHours : decimalHours;
    }

    function updateSystemNotifications() {
        const notifications = NotificationService.generateNotifications();
        NotificationService.saveNotifications(notifications);
    }

    // Notificações
    function generateNotifications() {
        const funcionarios = LocalStorageService.getData('funcionarios') || [];
        const eventos = LocalStorageService.getData('eventos') || [];
        const bancoHoras = LocalStorageService.getData('banco_horas') || [];
        const notifications = [];
        const today = new Date();

        // Férias
        funcionarios.forEach(func => {
            if (func.dataInicioFerias) {
                const inicioFerias = new Date(func.dataInicioFerias);
                const diasAteFerias = Math.ceil((inicioFerias - today) / (1000 * 60 * 60 * 24));
                
                if ([30, 15, 7].includes(diasAteFerias)) {
                    notifications.push({
                        type: 'ferias',
                        message: `Férias de ${func.nome} começam em ${diasAteFerias} dias (${inicioFerias.toLocaleDateString()})`,
                        severity: 'warning'
                    });
                }
            }

            // Aniversários
            if (func.dataNascimento) {
                const nascimento = new Date(func.dataNascimento);
                if (
                    nascimento.getMonth() === today.getMonth() && 
                    nascimento.getDate() === today.getDate()
                ) {
                    notifications.push({
                        type: 'aniversario',
                        message: `Hoje é o aniversário de ${func.nome}! 🎉`,
                        severity: 'success'
                    });
                }
            }
        });

        // Avaliações Periódicas (assumindo campo adicional no funcionário)
        funcionarios.forEach(func => {
            if (func.proximaAvaliacao) {
                const proximaAvaliacao = new Date(func.proximaAvaliacao);
                const diasAteAvaliacao = Math.ceil((proximaAvaliacao - today) / (1000 * 60 * 60 * 24));
                
                if ([30, 15, 7].includes(diasAteAvaliacao)) {
                    notifications.push({
                        type: 'avaliacao',
                        message: `Avaliação de ${func.nome} está próxima em ${diasAteAvaliacao} dias (${proximaAvaliacao.toLocaleDateString()})`,
                        severity: 'info'
                    });
                }
            }
        });

        // Banco de Horas Crítico
        funcionarios.forEach(func => {
            const horasFuncionario = bancoHoras.filter(bh => bh.funcionario === func.nome);
            const saldoTotal = horasFuncionario.reduce((sum, bh) => 
                sum + convertTimeToHours(bh.saldo), 0);
            
            if (saldoTotal < -20) {
                notifications.push({
                    type: 'banco-horas',
                    message: `Saldo de Banco de Horas de ${func.nome} está crítico: ${saldoTotal.toFixed(2)}h`,
                    severity: 'danger'
                });
            }
        });

        // Atrasos e Faltas Acumuladas
        const atrasosPorFuncionario = {};
        eventos.forEach(evento => {
            if (evento.tipo === 'atraso') {
                atrasosPorFuncionario[evento.funcionario] = 
                    (atrasosPorFuncionario[evento.funcionario] || 0) + 1;
            }
        });

        Object.entries(atrasosPorFuncionario).forEach(([funcionario, qtdAtrasos]) => {
            if (qtdAtrasos >= 3) {
                notifications.push({
                    type: 'atrasos',
                    message: `${funcionario} tem ${qtdAtrasos} atrasos registrados`,
                    severity: 'warning'
                });
            }
        });

        return notifications;
    }

    function updateSalaryMetrics() {
        const salarios = LocalStorageService.getData('salarios') || [];
        const employeeName = document.getElementById('employeeFilter').value;
        
        let totalSalarios = 0;
        
        if (employeeName) {
            const funcionarioSalario = salarios.find(s => s.colaborador === employeeName);
            totalSalarios = funcionarioSalario ? funcionarioSalario.salario : 0;
        } else {
            totalSalarios = salarios.reduce((sum, s) => sum + s.salario, 0);
        }
        
        document.getElementById('totalSalarios').textContent = 
            `R$ ${totalSalarios.toFixed(2).replace('.', ',')}`;
    }

    // Add this new function
    function calcularMediaSalarial(salarios) {
        if (!salarios.length) return 'R$ 0,00';
        const totalSalarios = salarios.reduce((sum, s) => sum + (s.salario || 0), 0);
        const media = totalSalarios / salarios.length;
        return `R$ ${media.toFixed(2).replace('.', ',')}`;
    }

    updateSystemNotifications();

    // Event Listeners
    document.getElementById('applyFilters').addEventListener('click', updateDashboard);
    document.getElementById('periodFilter').addEventListener('change', updateDashboard);
    document.getElementById('employeeFilter').addEventListener('change', updateDashboard);
    document.getElementById('eventTypeFilter').addEventListener('change', updateDashboard);

    // Initial dashboard update
    updateDashboard();

    // Add this style
    const style = document.createElement('style');
    style.textContent = `
        .cursor-pointer {
            cursor: pointer;
            transition: transform 0.2s;
        }
        .cursor-pointer:hover {
            transform: scale(1.02);
        }
    `;
    document.head.appendChild(style);
}