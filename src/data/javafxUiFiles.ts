import { JavaFxProjectFile } from './javafxCoreFiles';

export const JAVAFX_UI_FILES: JavaFxProjectFile[] = [
  {
    path: 'src/main/java/com/smartexpense/ui/ThemeManager.java',
    name: 'ThemeManager.java',
    layer: 'UI & Controller',
    language: 'java',
    oopHighlight: 'Encapsulated theme controller swapping Light and Dark JavaFX CSS stylesheets at runtime.',
    content: `package com.smartexpense.ui;

import javafx.scene.Scene;

import java.util.Objects;

public class ThemeManager {

    private static final String LIGHT_CSS = "/styles/light-theme.css";
    private static final String DARK_CSS = "/styles/dark-theme.css";

    private boolean darkMode;

    public ThemeManager(boolean initialDarkMode) {
        this.darkMode = initialDarkMode;
    }

    public void apply(Scene scene) {
        scene.getStylesheets().clear();
        String path = darkMode ? DARK_CSS : LIGHT_CSS;
        String url = Objects.requireNonNull(
                getClass().getResource(path),
                "Missing stylesheet resource: " + path
        ).toExternalForm();
        scene.getStylesheets().add(url);
    }

    public boolean toggle(Scene scene) {
        this.darkMode = !this.darkMode;
        apply(scene);
        return darkMode;
    }

    public boolean isDarkMode() {
        return darkMode;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/ui/DashboardPane.java',
    name: 'DashboardPane.java',
    layer: 'UI & Controller',
    language: 'java',
    oopHighlight: 'JavaFX analytics view featuring real-time KPI cards, Category PieChart, Monthly BarChart, and live budget alerts.',
    content: `package com.smartexpense.ui;

import com.smartexpense.model.*;
import com.smartexpense.service.FinanceService;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.chart.*;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

public class DashboardPane extends ScrollPane {

    private final FinanceService service;
    private final Label balanceValue = new Label("$0.00");
    private final Label incomeValue = new Label("$0.00");
    private final Label expenseValue = new Label("$0.00");
    private final Label savingsRateValue = new Label("0.0%");
    private final VBox alertsBox = new VBox(8);
    private final PieChart categoryPieChart = new PieChart();
    private final BarChart<String, Number> monthlyBarChart;

    public DashboardPane(FinanceService service) {
        this.service = service;

        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis yAxis = new NumberAxis();
        xAxis.setLabel("Month");
        yAxis.setLabel("USD ($)");
        this.monthlyBarChart = new BarChart<>(xAxis, yAxis);
        this.monthlyBarChart.setTitle("Monthly Income vs. Expenses");
        this.monthlyBarChart.setAnimated(false);

        this.categoryPieChart.setTitle("Spending by Category (This Month)");
        this.categoryPieChart.setAnimated(false);

        VBox root = new VBox(20);
        root.setPadding(new Insets(24));
        root.getStyleClass().add("content-root");

        Label heading = new Label("Financial Overview");
        heading.getStyleClass().add("page-title");

        GridPane kpiGrid = new GridPane();
        kpiGrid.setHgap(16);
        kpiGrid.setVgap(16);
        for (int i = 0; i < 4; i++) {
            ColumnConstraints col = new ColumnConstraints();
            col.setPercentWidth(25);
            kpiGrid.getColumnConstraints().add(col);
        }
        kpiGrid.add(createKpiCard("Net Balance", balanceValue), 0, 0);
        kpiGrid.add(createKpiCard("Total Income", incomeValue), 1, 0);
        kpiGrid.add(createKpiCard("Total Expenses", expenseValue), 2, 0);
        kpiGrid.add(createKpiCard("Savings Rate", savingsRateValue), 3, 0);

        HBox chartsRow = new HBox(16, wrapCard(categoryPieChart), wrapCard(monthlyBarChart));
        HBox.setHgrow(chartsRow.getChildren().get(0), Priority.ALWAYS);
        HBox.setHgrow(chartsRow.getChildren().get(1), Priority.ALWAYS);

        root.getChildren().addAll(heading, kpiGrid, alertsBox, chartsRow);
        setContent(root);
        setFitToWidth(true);
        getStyleClass().add("transparent-scroll");
    }

    private VBox createKpiCard(String title, Label valueLabel) {
        Label titleLabel = new Label(title);
        titleLabel.getStyleClass().add("kpi-label");
        valueLabel.getStyleClass().add("kpi-value");
        VBox box = new VBox(6, titleLabel, valueLabel);
        box.setPadding(new Insets(16));
        box.getStyleClass().add("surface-card");
        return box;
    }

    private VBox wrapCard(Region node) {
        VBox box = new VBox(node);
        box.setPadding(new Insets(16));
        box.getStyleClass().add("surface-card");
        box.setPrefHeight(360);
        return box;
    }

    public void refresh(List<BudgetAlert> activeAlerts) {
        FinancialSummary summary = service.calculateSummary(service.getAllTransactions());
        balanceValue.setText(String.format("$%,.2f", summary.netBalance()));
        incomeValue.setText(String.format("$%,.2f", summary.totalIncome()));
        expenseValue.setText(String.format("$%,.2f", summary.totalExpense()));
        savingsRateValue.setText(String.format("%.1f%%", summary.savingsRatePercent()));

        // Update overspending alerts
        alertsBox.getChildren().clear();
        for (BudgetAlert alert : activeAlerts) {
            String prefix = alert.severity() == BudgetAlert.Severity.EXCEEDED
                    ? "Over Budget: " : "Approaching Limit: ";
            Label msg = new Label(String.format(
                    "%s%s — Spent $%,.2f of $%,.2f (%.0f%%)",
                    prefix, alert.categoryName(), alert.spent(), alert.limit(), alert.ratio() * 100
            ));
            msg.getStyleClass().add(alert.severity() == BudgetAlert.Severity.EXCEEDED
                    ? "alert-danger" : "alert-warning");
            alertsBox.getChildren().add(msg);
        }

        // Update Category PieChart
        YearMonth currentMonth = YearMonth.now();
        Map<String, String> catNames = service.getAllCategories().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));
        Map<String, BigDecimal> byCat = service.expenseTotalsByCategory(currentMonth);

        var pieData = FXCollections.<PieChart.Data>observableArrayList();
        byCat.forEach((catId, total) ->
                pieData.add(new PieChart.Data(catNames.getOrDefault(catId, "Other"), total.doubleValue())));
        categoryPieChart.setData(pieData);

        // Update Monthly BarChart (last 4 months)
        monthlyBarChart.getData().clear();
        XYChart.Series<String, Number> incomeSeries = new XYChart.Series<>();
        incomeSeries.setName("Income");
        XYChart.Series<String, Number> expenseSeries = new XYChart.Series<>();
        expenseSeries.setName("Expenses");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 3; i >= 0; i--) {
            YearMonth ym = currentMonth.minusMonths(i);
            List<Transaction> monthly = service.getAllTransactions().stream()
                    .filter(t -> YearMonth.from(t.getDate()).equals(ym))
                    .toList();
            FinancialSummary ms = service.calculateSummary(monthly);
            String label = ym.format(fmt);
            incomeSeries.getData().add(new XYChart.Data<>(label, ms.totalIncome().doubleValue()));
            expenseSeries.getData().add(new XYChart.Data<>(label, ms.totalExpense().doubleValue()));
        }
        monthlyBarChart.getData().addAll(incomeSeries, expenseSeries);
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/ui/TransactionsPane.java',
    name: 'TransactionsPane.java',
    layer: 'UI & Controller',
    language: 'java',
    oopHighlight: 'JavaFX TableView with live search, type/date filters, Strategy sorting, CRUD modal dialog, and CSV/TXT report export.',
    content: `package com.smartexpense.ui;

import com.smartexpense.model.*;
import com.smartexpense.service.*;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TransactionsPane extends VBox {

    private final FinanceService service;
    private final Runnable onDataChanged;

    private final TextField searchField = new TextField();
    private final ComboBox<String> typeFilter = new ComboBox<>();
    private final ComboBox<TransactionSortStrategy> sortBox = new ComboBox<>();
    private final DatePicker startDatePicker = new DatePicker();
    private final DatePicker endDatePicker = new DatePicker();
    private final TableView<Transaction> table = new TableView<>();

    public TransactionsPane(FinanceService service, Runnable onDataChanged) {
        this.service = service;
        this.onDataChanged = onDataChanged;

        setSpacing(16);
        setPadding(new Insets(24));
        getStyleClass().add("content-root");

        Label title = new Label("Transactions Ledger");
        title.getStyleClass().add("page-title");

        Button addBtn = new Button("+ Add Transaction");
        addBtn.getStyleClass().add("primary-button");
        addBtn.setOnAction(e -> openTransactionDialog(null));

        Button editBtn = new Button("Edit Selected");
        editBtn.setOnAction(e -> {
            Transaction sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) openTransactionDialog(sel);
        });

        Button deleteBtn = new Button("Delete Selected");
        deleteBtn.setOnAction(e -> {
            Transaction sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                service.deleteTransaction(sel.getId());
                onDataChanged.run();
            }
        });

        Button exportCsvBtn = new Button("Export CSV");
        exportCsvBtn.setOnAction(e -> exportReport(new CsvReportExporter()));

        Button exportTxtBtn = new Button("Export TXT");
        exportTxtBtn.setOnAction(e -> exportReport(new TextReportExporter()));

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        HBox header = new HBox(10, title, spacer, exportCsvBtn, exportTxtBtn, editBtn, deleteBtn, addBtn);

        searchField.setPromptText("Search title, notes, or payment source...");
        searchField.textProperty().addListener((obs, o, n) -> refresh());

        typeFilter.setItems(FXCollections.observableArrayList("All", "Expense", "Income"));
        typeFilter.setValue("All");
        typeFilter.setOnAction(e -> refresh());

        sortBox.setItems(FXCollections.observableArrayList(TransactionSortStrategy.values()));
        sortBox.setValue(TransactionSortStrategy.DATE_DESC);
        sortBox.setOnAction(e -> refresh());

        startDatePicker.setPromptText("From date");
        endDatePicker.setPromptText("To date");
        startDatePicker.setOnAction(e -> refresh());
        endDatePicker.setOnAction(e -> refresh());

        HBox filters = new HBox(10, searchField, typeFilter, sortBox, startDatePicker, endDatePicker);
        HBox.setHgrow(searchField, Priority.ALWAYS);

        configureTable();
        VBox.setVgrow(table, Priority.ALWAYS);

        getChildren().addAll(header, filters, table);
    }

    private void configureTable() {
        TableColumn<Transaction, String> dateCol = new TableColumn<>("Date");
        dateCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getDate().toString()));

        TableColumn<Transaction, String> titleCol = new TableColumn<>("Description");
        titleCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getTitle()));
        titleCol.setPrefWidth(220);

        TableColumn<Transaction, String> typeCol = new TableColumn<>("Type");
        typeCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getType().getDisplayName()));

        TableColumn<Transaction, String> categoryCol = new TableColumn<>("Category");
        categoryCol.setCellValueFactory(c -> {
            Map<String, String> names = service.getAllCategories().stream()
                    .collect(Collectors.toMap(Category::getId, Category::getName));
            return new SimpleStringProperty(names.getOrDefault(c.getValue().getCategoryId(), "Other"));
        });

        TableColumn<Transaction, String> amountCol = new TableColumn<>("Amount");
        amountCol.setCellValueFactory(c -> new SimpleStringProperty(
                String.format("$%,.2f", c.getValue().signedAmount())));

        table.getColumns().addAll(List.of(dateCol, titleCol, typeCol, categoryCol, amountCol));
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN);
    }

    public void refresh() {
        TransactionType type = switch (typeFilter.getValue()) {
            case "Expense" -> TransactionType.EXPENSE;
            case "Income" -> TransactionType.INCOME;
            default -> null;
        };
        TransactionFilterCriteria criteria = new TransactionFilterCriteria(
                searchField.getText(), type, null, startDatePicker.getValue(), endDatePicker.getValue()
        );
        table.setItems(FXCollections.observableArrayList(
                service.queryTransactions(criteria, sortBox.getValue())
        ));
    }

    private void openTransactionDialog(Transaction existing) {
        Dialog<Transaction> dialog = new Dialog<>();
        dialog.setTitle(existing == null ? "Add Transaction" : "Edit Transaction");
        ButtonType saveType = new ButtonType("Save", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(saveType, ButtonType.CANCEL);

        ComboBox<TransactionType> typeBox = new ComboBox<>(
                FXCollections.observableArrayList(TransactionType.values()));
        typeBox.setValue(existing == null ? TransactionType.EXPENSE : existing.getType());

        TextField titleInput = new TextField(existing == null ? "" : existing.getTitle());
        TextField amountInput = new TextField(existing == null ? "" : existing.getAmount().toPlainString());
        ComboBox<Category> categoryBox = new ComboBox<>(
                FXCollections.observableArrayList(service.getAllCategories()));
        if (!service.getAllCategories().isEmpty()) {
            categoryBox.setValue(service.getAllCategories().getFirst());
        }
        DatePicker datePicker = new DatePicker(existing == null ? LocalDate.now() : existing.getDate());
        TextField detailInput = new TextField(existing == null ? "" : existing.getDetailLabel());
        TextField notesInput = new TextField(existing == null ? "" : existing.getNotes());

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.addRow(0, new Label("Type:"), typeBox);
        grid.addRow(1, new Label("Title:"), titleInput);
        grid.addRow(2, new Label("Amount ($):"), amountInput);
        grid.addRow(3, new Label("Category:"), categoryBox);
        grid.addRow(4, new Label("Date:"), datePicker);
        grid.addRow(5, new Label("Method / Source:"), detailInput);
        grid.addRow(6, new Label("Notes:"), notesInput);
        dialog.getDialogPane().setContent(grid);

        dialog.setResultConverter(btn -> {
            if (btn != saveType) return null;
            BigDecimal amount = new BigDecimal(amountInput.getText().trim());
            String id = existing == null ? null : existing.getId();
            String catId = categoryBox.getValue().getId();
            return typeBox.getValue() == TransactionType.EXPENSE
                    ? new Expense(id, titleInput.getText(), amount, catId, datePicker.getValue(),
                            notesInput.getText(), detailInput.getText(), false)
                    : new Income(id, titleInput.getText(), amount, catId, datePicker.getValue(),
                            notesInput.getText(), detailInput.getText());
        });

        dialog.showAndWait().ifPresent(tx -> {
            service.addOrUpdateTransaction(tx);
            onDataChanged.run();
        });
    }

    private void exportReport(ReportExporter exporter) {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Export Financial Report");
        chooser.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Report (" + exporter.fileExtension() + ")", exporter.fileExtension())
        );
        File target = chooser.showSaveDialog(getScene().getWindow());
        if (target == null) return;

        try {
            List<Transaction> visible = table.getItems();
            exporter.export(
                    target.toPath(),
                    visible,
                    service.getAllCategories(),
                    service.calculateSummary(visible)
            );
        } catch (IOException ex) {
            new Alert(Alert.AlertType.ERROR, "Export failed: " + ex.getMessage()).showAndWait();
        }
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/ui/BudgetsPane.java',
    name: 'BudgetsPane.java',
    layer: 'UI & Controller',
    language: 'java',
    oopHighlight: 'Category manager and monthly spending limit progress visualizer with real-time overspending indicators.',
    content: `package com.smartexpense.ui;

import com.smartexpense.model.Category;
import com.smartexpense.model.TransactionType;
import com.smartexpense.service.FinanceService;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.Map;

public class BudgetsPane extends ScrollPane {

    private final FinanceService service;
    private final Runnable onDataChanged;
    private final VBox listContainer = new VBox(12);

    public BudgetsPane(FinanceService service, Runnable onDataChanged) {
        this.service = service;
        this.onDataChanged = onDataChanged;

        VBox root = new VBox(18);
        root.setPadding(new Insets(24));
        root.getStyleClass().add("content-root");

        Label heading = new Label("Categories & Monthly Budgets");
        heading.getStyleClass().add("page-title");

        TextField nameField = new TextField();
        nameField.setPromptText("Category name (e.g. Dining, Books)");
        TextField limitField = new TextField();
        limitField.setPromptText("Monthly limit ($)");
        ComboBox<TransactionType> typeBox = new ComboBox<>();
        typeBox.getItems().addAll(TransactionType.EXPENSE, TransactionType.INCOME);
        typeBox.setValue(TransactionType.EXPENSE);

        Button addBtn = new Button("Add Category");
        addBtn.getStyleClass().add("primary-button");
        addBtn.setOnAction(e -> {
            if (nameField.getText().isBlank()) return;
            BigDecimal limit = limitField.getText().isBlank()
                    ? BigDecimal.ZERO : new BigDecimal(limitField.getText().trim());
            service.saveCategory(new Category(null, nameField.getText(), typeBox.getValue(), limit, "#0F766E"));
            nameField.clear();
            limitField.clear();
            onDataChanged.run();
        });

        HBox createRow = new HBox(10, nameField, typeBox, limitField, addBtn);
        HBox.setHgrow(nameField, Priority.ALWAYS);

        root.getChildren().addAll(heading, createRow, listContainer);
        setContent(root);
        setFitToWidth(true);
        getStyleClass().add("transparent-scroll");
    }

    public void refresh() {
        listContainer.getChildren().clear();
        Map<String, BigDecimal> spentByCategory = service.expenseTotalsByCategory(YearMonth.now());

        for (Category cat : service.getAllCategories()) {
            VBox card = new VBox(8);
            card.setPadding(new Insets(14));
            card.getStyleClass().add("surface-card");

            BigDecimal spent = spentByCategory.getOrDefault(cat.getId(), BigDecimal.ZERO);
            Label title = new Label(cat.getName() + "  ·  " + cat.getType().getDisplayName());
            title.getStyleClass().add("card-title");

            if (cat.getType() == TransactionType.EXPENSE && cat.getMonthlyBudgetLimit().compareTo(BigDecimal.ZERO) > 0) {
                double ratio = spent.divide(cat.getMonthlyBudgetLimit(), 4, RoundingMode.HALF_UP).doubleValue();
                ProgressBar bar = new ProgressBar(Math.min(1.0, ratio));
                bar.setMaxWidth(Double.MAX_VALUE);
                Label status = new Label(String.format(
                        "Spent $%,.2f of $%,.2f (%.0f%%)%s",
                        spent, cat.getMonthlyBudgetLimit(), ratio * 100,
                        ratio >= 1.0 ? " — Over budget" : ratio >= 0.8 ? " — Approaching limit" : ""
                ));
                card.getChildren().addAll(title, bar, status);
            } else {
                card.getChildren().add(title);
            }

            listContainer.getChildren().add(card);
        }
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/ui/BillsAndGoalsPane.java',
    name: 'BillsAndGoalsPane.java',
    layer: 'UI & Controller',
    language: 'java',
    oopHighlight: 'Dual workspace for Recurring Bill reminders (with one-click Pay & Log Expense) and Savings Goal progress.',
    content: `package com.smartexpense.ui;

import com.smartexpense.model.RecurringBill;
import com.smartexpense.model.SavingsGoal;
import com.smartexpense.service.FinanceService;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BillsAndGoalsPane extends ScrollPane {

    private final FinanceService service;
    private final Runnable onDataChanged;
    private final VBox billsBox = new VBox(10);
    private final VBox goalsBox = new VBox(10);

    public BillsAndGoalsPane(FinanceService service, Runnable onDataChanged) {
        this.service = service;
        this.onDataChanged = onDataChanged;

        VBox root = new VBox(24);
        root.setPadding(new Insets(24));
        root.getStyleClass().add("content-root");

        Label billsTitle = new Label("Recurring Bills & Subscriptions");
        billsTitle.getStyleClass().add("page-title");

        Label goalsTitle = new Label("Savings Goals");
        goalsTitle.getStyleClass().add("page-title");

        root.getChildren().addAll(billsTitle, billsBox, goalsTitle, goalsBox);
        setContent(root);
        setFitToWidth(true);
        getStyleClass().add("transparent-scroll");
    }

    public void refresh() {
        billsBox.getChildren().clear();
        for (RecurringBill bill : service.getAllBills()) {
            long days = bill.daysUntilDue(LocalDate.now());
            Label info = new Label(String.format(
                    "%s — $%,.2f · Due %s (%d days)",
                    bill.getTitle(), bill.getAmount(), bill.getDueDate(), days
            ));
            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);

            Button payBtn = new Button("Mark Paid & Log Expense");
            payBtn.getStyleClass().add("primary-button");
            payBtn.setOnAction(e -> {
                service.payRecurringBill(bill.getId());
                onDataChanged.run();
            });

            HBox row = new HBox(12, info, spacer, payBtn);
            row.setPadding(new Insets(12));
            row.getStyleClass().add("surface-card");
            billsBox.getChildren().add(row);
        }

        goalsBox.getChildren().clear();
        for (SavingsGoal goal : service.getAllGoals()) {
            Label title = new Label(String.format(
                    "%s — $%,.2f / $%,.2f (Target: %s)",
                    goal.getName(), goal.getCurrentAmount(), goal.getTargetAmount(), goal.getTargetDate()
            ));
            ProgressBar bar = new ProgressBar(goal.progressRatio());
            bar.setMaxWidth(Double.MAX_VALUE);

            Button add50 = new Button("+ Contribute $50");
            add50.setOnAction(e -> {
                service.contributeToGoal(goal.getId(), new BigDecimal("50.00"));
                onDataChanged.run();
            });

            VBox card = new VBox(8, title, bar, add50);
            card.setPadding(new Insets(14));
            card.getStyleClass().add("surface-card");
            goalsBox.getChildren().add(card);
        }
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/ui/MainController.java',
    name: 'MainController.java',
    layer: 'UI & Controller',
    language: 'java',
    oopHighlight: 'MVC Coordinator implementing BudgetAlertObserver to synchronize all JavaFX views cleanly.',
    content: `package com.smartexpense.ui;

import com.smartexpense.model.BudgetAlert;
import com.smartexpense.service.BudgetAlertObserver;
import com.smartexpense.service.FinanceService;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.*;

import java.time.YearMonth;
import java.util.List;

public class MainController implements BudgetAlertObserver {

    private final FinanceService service;
    private final ThemeManager themeManager;
    private final BorderPane root = new BorderPane();

    private final DashboardPane dashboardPane;
    private final TransactionsPane transactionsPane;
    private final BudgetsPane budgetsPane;
    private final BillsAndGoalsPane billsAndGoalsPane;

    public MainController(FinanceService service, ThemeManager themeManager) {
        this.service = service;
        this.themeManager = themeManager;

        this.dashboardPane = new DashboardPane(service);
        this.transactionsPane = new TransactionsPane(service, this::refreshAll);
        this.budgetsPane = new BudgetsPane(service, this::refreshAll);
        this.billsAndGoalsPane = new BillsAndGoalsPane(service, this::refreshAll);

        service.addAlertObserver(this);
        buildShell();
        refreshAll();
    }

    private void buildShell() {
        VBox sidebar = new VBox(8);
        sidebar.setPrefWidth(220);
        sidebar.setPadding(new Insets(20, 14, 20, 14));
        sidebar.getStyleClass().add("sidebar");

        Label brand = new Label("Smart Expense");
        brand.getStyleClass().add("brand-title");

        Button navDashboard = navButton("Overview", () -> root.setCenter(dashboardPane));
        Button navTransactions = navButton("Transactions", () -> root.setCenter(transactionsPane));
        Button navBudgets = navButton("Budgets & Categories", () -> root.setCenter(budgetsPane));
        Button navBillsGoals = navButton("Bills & Goals", () -> root.setCenter(billsAndGoalsPane));

        Region spacer = new Region();
        VBox.setVgrow(spacer, Priority.ALWAYS);

        Button themeToggle = new Button("Toggle Dark / Light");
        themeToggle.setMaxWidth(Double.MAX_VALUE);
        themeToggle.setOnAction(e -> {
            Scene scene = root.getScene();
            if (scene != null) {
                boolean dark = themeManager.toggle(scene);
                service.setDarkTheme(dark);
            }
        });

        sidebar.getChildren().addAll(
                brand, navDashboard, navTransactions, navBudgets, navBillsGoals, spacer, themeToggle
        );

        root.setLeft(sidebar);
        root.setCenter(dashboardPane);
    }

    private Button navButton(String text, Runnable action) {
        Button btn = new Button(text);
        btn.setMaxWidth(Double.MAX_VALUE);
        btn.getStyleClass().add("nav-button");
        btn.setOnAction(e -> action.run());
        return btn;
    }

    public void refreshAll() {
        List<BudgetAlert> alerts = service.evaluateBudgetAlerts(YearMonth.now());
        dashboardPane.refresh(alerts);
        transactionsPane.refresh();
        budgetsPane.refresh();
        billsAndGoalsPane.refresh();
    }

    @Override
    public void onBudgetAlertsUpdated(List<BudgetAlert> activeAlerts) {
        dashboardPane.refresh(activeAlerts);
    }

    public BorderPane getRoot() {
        return root;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/ui/SmartExpenseApp.java',
    name: 'SmartExpenseApp.java',
    layer: 'UI & Controller',
    language: 'java',
    oopHighlight: 'Composition Root wiring Repository -> Service -> Controller -> JavaFX Stage with clean Dependency Injection.',
    content: `package com.smartexpense.ui;

import com.smartexpense.repository.JsonStorageRepository;
import com.smartexpense.service.FinanceService;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class SmartExpenseApp extends Application {

    @Override
    public void start(Stage primaryStage) {
        // Composition Root: Explicit constructor-based Dependency Injection
        JsonStorageRepository storage = JsonStorageRepository.defaultUserStorage();
        FinanceService financeService = new FinanceService(storage);
        ThemeManager themeManager = new ThemeManager(financeService.isDarkTheme());
        MainController controller = new MainController(financeService, themeManager);

        Scene scene = new Scene(controller.getRoot(), 1240, 800);
        themeManager.apply(scene);

        primaryStage.setTitle("Smart Expense & Budget Tracker");
        primaryStage.setMinWidth(960);
        primaryStage.setMinHeight(640);
        primaryStage.setScene(scene);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
`,
  },
  {
    path: 'src/main/resources/styles/light-theme.css',
    name: 'light-theme.css',
    layer: 'Resources',
    language: 'css',
    oopHighlight: 'JavaFX Light Mode stylesheet with crisp neutral surfaces and teal primary accents.',
    content: `.root {
    -fx-font-family: "Inter", "System";
    -fx-background-color: #F8FAFC;
    -fx-text-fill: #0F172A;
}

.sidebar {
    -fx-background-color: #FFFFFF;
    -fx-border-color: #E2E8F0;
    -fx-border-width: 0 1 0 0;
}

.brand-title {
    -fx-font-family: "Plus Jakarta Sans", "System";
    -fx-font-size: 18px;
    -fx-font-weight: bold;
    -fx-text-fill: #0F172A;
    -fx-padding: 0 0 14 4;
}

.page-title, .card-title {
    -fx-font-family: "Plus Jakarta Sans", "System";
    -fx-font-size: 22px;
    -fx-font-weight: bold;
    -fx-text-fill: #0F172A;
}

.card-title {
    -fx-font-size: 14px;
}

.surface-card {
    -fx-background-color: #FFFFFF;
    -fx-border-color: #E2E8F0;
    -fx-border-radius: 8px;
    -fx-background-radius: 8px;
}

.kpi-label {
    -fx-font-size: 12px;
    -fx-text-fill: #64748B;
}

.kpi-value {
    -fx-font-family: "JetBrains Mono", "Monospaced";
    -fx-font-size: 22px;
    -fx-font-weight: bold;
    -fx-text-fill: #0F172A;
}

.nav-button {
    -fx-alignment: CENTER_LEFT;
    -fx-background-color: transparent;
    -fx-text-fill: #334155;
    -fx-padding: 10 12 10 12;
    -fx-background-radius: 6px;
}

.nav-button:hover {
    -fx-background-color: #F1F5F9;
    -fx-text-fill: #0F172A;
}

.primary-button {
    -fx-background-color: #0F766E;
    -fx-text-fill: #FFFFFF;
    -fx-font-weight: bold;
    -fx-padding: 8 16 8 16;
    -fx-background-radius: 6px;
}

.alert-warning {
    -fx-background-color: #FEF3C7;
    -fx-text-fill: #92400E;
    -fx-padding: 10 14 10 14;
    -fx-background-radius: 6px;
}

.alert-danger {
    -fx-background-color: #FEE2E2;
    -fx-text-fill: #991B1B;
    -fx-padding: 10 14 10 14;
    -fx-background-radius: 6px;
}
`,
  },
  {
    path: 'src/main/resources/styles/dark-theme.css',
    name: 'dark-theme.css',
    layer: 'Resources',
    language: 'css',
    oopHighlight: 'JavaFX Dark Mode stylesheet using a high-contrast black-and-white monochrome palette.',
    content: `.root {
    -fx-font-family: "Inter", "System";
    -fx-background-color: #000000;
    -fx-text-fill: #FFFFFF;
}

.sidebar {
    -fx-background-color: #0A0A0A;
    -fx-border-color: #262626;
    -fx-border-width: 0 1 0 0;
}

.brand-title, .page-title, .card-title {
    -fx-font-family: "Plus Jakarta Sans", "System";
    -fx-text-fill: #FFFFFF;
    -fx-font-weight: bold;
}

.kpi-value {
    -fx-font-family: "JetBrains Mono", "Monospaced";
    -fx-text-fill: #FFFFFF;
    -fx-font-weight: bold;
    -fx-font-size: 22px;
}

.brand-title { -fx-font-size: 18px; -fx-padding: 0 0 14 4; }
.page-title  { -fx-font-size: 22px; }

.surface-card {
    -fx-background-color: #0A0A0A;
    -fx-border-color: #262626;
    -fx-border-radius: 8px;
    -fx-background-radius: 8px;
}

.kpi-label {
    -fx-font-size: 12px;
    -fx-text-fill: #A3A3A3;
}

.nav-button {
    -fx-alignment: CENTER_LEFT;
    -fx-background-color: transparent;
    -fx-text-fill: #D4D4D4;
    -fx-padding: 10 12 10 12;
    -fx-background-radius: 6px;
}

.nav-button:hover {
    -fx-background-color: #171717;
    -fx-text-fill: #FFFFFF;
}

.primary-button {
    -fx-background-color: #FFFFFF;
    -fx-text-fill: #000000;
    -fx-font-weight: bold;
    -fx-padding: 8 16 8 16;
    -fx-background-radius: 6px;
}

.primary-button:hover {
    -fx-background-color: #E5E5E5;
}

.alert-warning {
    -fx-background-color: #171717;
    -fx-border-color: #525252;
    -fx-border-radius: 6px;
    -fx-text-fill: #E5E5E5;
    -fx-padding: 10 14 10 14;
    -fx-background-radius: 6px;
}

.alert-danger {
    -fx-background-color: #171717;
    -fx-border-color: #FFFFFF;
    -fx-border-radius: 6px;
    -fx-text-fill: #FFFFFF;
    -fx-font-weight: bold;
    -fx-padding: 10 14 10 14;
    -fx-background-radius: 6px;
}

.chart-title {
    -fx-font-family: "Plus Jakarta Sans", "System";
    -fx-text-fill: #FFFFFF;
    -fx-font-weight: bold;
}

.chart-plot-background {
    -fx-background-color: transparent;
}

.chart-horizontal-grid-lines, .chart-vertical-grid-lines {
    -fx-stroke: #262626;
}

.axis {
    -fx-tick-label-fill: #A3A3A3;
    -fx-tick-label-font-family: "JetBrains Mono", "Monospaced";
}

.axis-label, .chart-legend-item {
    -fx-text-fill: #D4D4D4;
}

.chart-legend {
    -fx-background-color: transparent;
}

.default-color0.chart-bar { -fx-bar-fill: #10B981; }
.default-color1.chart-bar { -fx-bar-fill: #F43F5E; }

.default-color0.chart-pie { -fx-pie-color: #14B8A6; }
.default-color1.chart-pie { -fx-pie-color: #38BDF8; }
.default-color2.chart-pie { -fx-pie-color: #F59E0B; }
.default-color3.chart-pie { -fx-pie-color: #A78BFA; }
.default-color4.chart-pie { -fx-pie-color: #60A5FA; }
.default-color5.chart-pie { -fx-pie-color: #34D399; }
`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    layer: 'Build & Module',
    language: 'markdown',
    oopHighlight: 'Build, run, and OOP architectural documentation for lab submission.',
    content: `# Smart Expense & Budget Tracker (JavaFX + JDK 25)

A clean-architecture JavaFX desktop application built with **JDK 25** and **Maven** for Object-Oriented Programming Lab.

## Requirements
- **JDK 25** (\`java -version\` should report 25.x)
- **Apache Maven 3.9+** (or IntelliJ IDEA 2025+ with bundled Maven)

## Run the Application
\`\`\`bash
mvn clean javafx:run
\`\`\`

## Run Automated Unit Tests
\`\`\`bash
mvn test
\`\`\`

## Clean Architectural Layers
1. **\`com.smartexpense.model\`** — Sealed polymorphic hierarchy (\`Transaction\` -> \`Expense\`, \`Income\`), \`Category\`, \`RecurringBill\`, \`SavingsGoal\`, and immutable Java \`record\`s (\`FinancialSummary\`, \`BudgetAlert\`).
2. **\`com.smartexpense.repository\`** — Generic \`Repository<T, ID>\` abstraction and atomic \`JsonStorageRepository\` with custom polymorphic Gson adapters.
3. **\`com.smartexpense.service\`** — Business logic (\`FinanceService\`), **Observer Pattern** (\`BudgetAlertObserver\`), **Strategy Pattern** (\`TransactionSortStrategy\`, \`ReportExporter\`, \`CsvReportExporter\`, \`TextReportExporter\`), and Specification filtering (\`TransactionFilterCriteria\`).
4. **\`com.smartexpense.ui\`** — JavaFX MVC views (\`DashboardPane\`, \`TransactionsPane\`, \`BudgetsPane\`, \`BillsAndGoalsPane\`), \`MainController\`, \`ThemeManager\`, and \`SmartExpenseApp\` composition root.
`,
  },
];
