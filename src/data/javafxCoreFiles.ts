export interface JavaFxProjectFile {
  path: string;
  name: string;
  layer: 'Build & Module' | 'Model' | 'Repository' | 'Service' | 'UI & Controller' | 'Resources' | 'Tests';
  language: 'java' | 'xml' | 'css' | 'markdown';
  oopHighlight: string;
  content: string;
}

export const JAVAFX_CORE_FILES: JavaFxProjectFile[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    layer: 'Build & Module',
    language: 'xml',
    oopHighlight: 'Maven configuration targeting JDK 25 (--release 25), JavaFX 25 controls, Gson persistence, and JUnit 5.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.smartexpense</groupId>
    <artifactId>smart-expense-tracker</artifactId>
    <version>1.0.0</version>
    <name>Smart Expense &amp; Budget Tracker</name>
    <description>OOP Lab JavaFX Desktop Application built with JDK 25 and Clean Layered Architecture</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.release>25</maven.compiler.release>
        <javafx.version>25</javafx.version>
        <gson.version>2.11.0</gson.version>
        <junit.version>5.11.4</junit.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.openjfx</groupId>
            <artifactId>javafx-controls</artifactId>
            <version>\${javafx.version}</version>
        </dependency>
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>\${gson.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.14.0</version>
                <configuration>
                    <release>25</release>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.openjfx</groupId>
                <artifactId>javafx-maven-plugin</artifactId>
                <version>0.0.8</version>
                <configuration>
                    <mainClass>com.smartexpense/com.smartexpense.ui.SmartExpenseApp</mainClass>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.5.2</version>
            </plugin>
        </plugins>
    </build>
</project>
`,
  },
  {
    path: 'src/main/java/module-info.java',
    name: 'module-info.java',
    layer: 'Build & Module',
    language: 'java',
    oopHighlight: 'Java Platform Module System (JPMS) descriptor enforcing clean encapsulation boundaries across packages.',
    content: `module com.smartexpense {
    requires javafx.controls;
    requires com.google.gson;

    exports com.smartexpense.ui;
    exports com.smartexpense.model;
    exports com.smartexpense.service;
    exports com.smartexpense.repository;

    opens com.smartexpense.model to com.google.gson, javafx.base;
    opens com.smartexpense.repository to com.google.gson;
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/TransactionType.java',
    name: 'TransactionType.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Type-safe domain enum distinguishing Expense and Income records.',
    content: `package com.smartexpense.model;

public enum TransactionType {
    EXPENSE("Expense"),
    INCOME("Income");

    private final String displayName;

    TransactionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/Transaction.java',
    name: 'Transaction.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Sealed abstract base class demonstrating Encapsulation, Inheritance, Abstraction, and Polymorphism (JDK 25).',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

/**
 * Sealed base entity for all financial transactions.
 * Only Expense and Income may extend this class, enabling exhaustive
 * pattern matching in JDK 25 switch expressions.
 */
public sealed abstract class Transaction permits Expense, Income {

    private final String id;
    private String title;
    private BigDecimal amount;
    private String categoryId;
    private LocalDate date;
    private String notes;

    protected Transaction(
            String id,
            String title,
            BigDecimal amount,
            String categoryId,
            LocalDate date,
            String notes
    ) {
        this.id = (id == null || id.isBlank()) ? UUID.randomUUID().toString() : id;
        setTitle(title);
        setAmount(amount);
        setCategoryId(categoryId);
        setDate(date);
        this.notes = notes == null ? "" : notes.trim();
    }

    /** Polymorphic contract returning the signed cash-flow impact. */
    public abstract BigDecimal signedAmount();

    /** Polymorphic contract returning the concrete transaction type. */
    public abstract TransactionType getType();

    /** Polymorphic detail label (payment method for Expense, source for Income). */
    public abstract String getDetailLabel();

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public final void setTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Transaction title must not be empty.");
        }
        this.title = title.trim();
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public final void setAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction amount must be positive.");
        }
        this.amount = amount;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public final void setCategoryId(String categoryId) {
        this.categoryId = Objects.requireNonNull(categoryId, "Category ID is required");
    }

    public LocalDate getDate() {
        return date;
    }

    public final void setDate(LocalDate date) {
        this.date = Objects.requireNonNull(date, "Transaction date is required");
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes == null ? "" : notes.trim();
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/Expense.java',
    name: 'Expense.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Concrete final subclass representing outgoing expenses with negative cash-flow sign.',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class Expense extends Transaction {

    private String paymentMethod;
    private boolean recurring;

    public Expense(
            String id,
            String title,
            BigDecimal amount,
            String categoryId,
            LocalDate date,
            String notes,
            String paymentMethod,
            boolean recurring
    ) {
        super(id, title, amount, categoryId, date, notes);
        this.paymentMethod = (paymentMethod == null || paymentMethod.isBlank())
                ? "Debit Card" : paymentMethod.trim();
        this.recurring = recurring;
    }

    @Override
    public BigDecimal signedAmount() {
        return getAmount().negate();
    }

    @Override
    public TransactionType getType() {
        return TransactionType.EXPENSE;
    }

    @Override
    public String getDetailLabel() {
        return paymentMethod;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = (paymentMethod == null || paymentMethod.isBlank())
                ? "Debit Card" : paymentMethod.trim();
    }

    public boolean isRecurring() {
        return recurring;
    }

    public void setRecurring(boolean recurring) {
        this.recurring = recurring;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/Income.java',
    name: 'Income.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Concrete final subclass representing incoming revenue with positive cash-flow sign.',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class Income extends Transaction {

    private String source;

    public Income(
            String id,
            String title,
            BigDecimal amount,
            String categoryId,
            LocalDate date,
            String notes,
            String source
    ) {
        super(id, title, amount, categoryId, date, notes);
        this.source = (source == null || source.isBlank())
                ? "Direct Transfer" : source.trim();
    }

    @Override
    public BigDecimal signedAmount() {
        return getAmount();
    }

    @Override
    public TransactionType getType() {
        return TransactionType.INCOME;
    }

    @Override
    public String getDetailLabel() {
        return source;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = (source == null || source.isBlank())
                ? "Direct Transfer" : source.trim();
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/Category.java',
    name: 'Category.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Encapsulated category entity storing monthly budget limits and color identity.',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

public class Category {

    private final String id;
    private String name;
    private TransactionType type;
    private BigDecimal monthlyBudgetLimit;
    private String colorHex;

    public Category(
            String id,
            String name,
            TransactionType type,
            BigDecimal monthlyBudgetLimit,
            String colorHex
    ) {
        this.id = (id == null || id.isBlank()) ? UUID.randomUUID().toString() : id;
        setName(name);
        this.type = Objects.requireNonNull(type, "Category type is required");
        setMonthlyBudgetLimit(monthlyBudgetLimit);
        this.colorHex = (colorHex == null || colorHex.isBlank()) ? "#0F766E" : colorHex;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public final void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Category name is required.");
        }
        this.name = name.trim();
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = Objects.requireNonNull(type);
    }

    public BigDecimal getMonthlyBudgetLimit() {
        return monthlyBudgetLimit;
    }

    public final void setMonthlyBudgetLimit(BigDecimal monthlyBudgetLimit) {
        if (monthlyBudgetLimit == null || monthlyBudgetLimit.compareTo(BigDecimal.ZERO) < 0) {
            this.monthlyBudgetLimit = BigDecimal.ZERO;
        } else {
            this.monthlyBudgetLimit = monthlyBudgetLimit;
        }
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    @Override
    public String toString() {
        return name;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/RecurringBill.java',
    name: 'RecurringBill.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Rich domain entity encapsulating billing cycle rollover and due-date calculations.',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

public class RecurringBill {

    public enum Frequency {
        WEEKLY, MONTHLY, YEARLY
    }

    private final String id;
    private String title;
    private BigDecimal amount;
    private String categoryId;
    private LocalDate dueDate;
    private Frequency frequency;
    private boolean paidForCycle;

    public RecurringBill(
            String id,
            String title,
            BigDecimal amount,
            String categoryId,
            LocalDate dueDate,
            Frequency frequency,
            boolean paidForCycle
    ) {
        this.id = (id == null || id.isBlank()) ? UUID.randomUUID().toString() : id;
        this.title = title;
        this.amount = amount;
        this.categoryId = categoryId;
        this.dueDate = dueDate;
        this.frequency = frequency == null ? Frequency.MONTHLY : frequency;
        this.paidForCycle = paidForCycle;
    }

    public long daysUntilDue(LocalDate today) {
        return ChronoUnit.DAYS.between(today, dueDate);
    }

    /** Advances due date to next cycle after payment is recorded. */
    public void markPaidAndAdvance() {
        this.dueDate = switch (frequency) {
            case WEEKLY -> dueDate.plusWeeks(1);
            case MONTHLY -> dueDate.plusMonths(1);
            case YEARLY -> dueDate.plusYears(1);
        };
        this.paidForCycle = true;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Frequency getFrequency() { return frequency; }
    public void setFrequency(Frequency frequency) { this.frequency = frequency; }
    public boolean isPaidForCycle() { return paidForCycle; }
    public void setPaidForCycle(boolean paidForCycle) { this.paidForCycle = paidForCycle; }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/SavingsGoal.java',
    name: 'SavingsGoal.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Domain model validating target contributions and calculating completion ratios.',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.UUID;

public class SavingsGoal {

    private final String id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private LocalDate targetDate;

    public SavingsGoal(
            String id,
            String name,
            BigDecimal targetAmount,
            BigDecimal currentAmount,
            LocalDate targetDate
    ) {
        this.id = (id == null || id.isBlank()) ? UUID.randomUUID().toString() : id;
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount == null ? BigDecimal.ZERO : currentAmount;
        this.targetDate = targetDate;
    }

    public void contribute(BigDecimal addition) {
        if (addition == null || addition.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Contribution must be greater than zero.");
        }
        this.currentAmount = this.currentAmount.add(addition);
    }

    public double progressRatio() {
        if (targetAmount == null || targetAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }
        double ratio = currentAmount.divide(targetAmount, 4, RoundingMode.HALF_UP).doubleValue();
        return Math.min(1.0, Math.max(0.0, ratio));
    }

    public BigDecimal remainingAmount() {
        BigDecimal diff = targetAmount.subtract(currentAmount);
        return diff.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : diff;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/FinancialSummary.java',
    name: 'FinancialSummary.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Immutable JDK 25 record representing real-time aggregated balance & savings rate.',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;

public record FinancialSummary(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal netBalance,
        double savingsRatePercent
) {}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/model/BudgetAlert.java',
    name: 'BudgetAlert.java',
    layer: 'Model',
    language: 'java',
    oopHighlight: 'Immutable record payload dispatched via the Observer pattern when limits are reached.',
    content: `package com.smartexpense.model;

import java.math.BigDecimal;

public record BudgetAlert(
        String categoryId,
        String categoryName,
        BigDecimal spent,
        BigDecimal limit,
        double ratio,
        Severity severity
) {
    public enum Severity {
        WARNING,
        EXCEEDED
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/repository/Repository.java',
    name: 'Repository.java',
    layer: 'Repository',
    language: 'java',
    oopHighlight: 'Generic Repository<T, ID> abstraction decoupling business logic from storage mechanics (DIP).',
    content: `package com.smartexpense.repository;

import java.util.List;
import java.util.Optional;

public interface Repository<T, ID> {
    List<T> findAll();
    Optional<T> findById(ID id);
    void save(T entity);
    void deleteById(ID id);
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/repository/AppDataSnapshot.java',
    name: 'AppDataSnapshot.java',
    layer: 'Repository',
    language: 'java',
    oopHighlight: 'Aggregate DTO serialized atomically to persistent JSON storage.',
    content: `package com.smartexpense.repository;

import com.smartexpense.model.Category;
import com.smartexpense.model.RecurringBill;
import com.smartexpense.model.SavingsGoal;
import com.smartexpense.model.Transaction;

import java.util.ArrayList;
import java.util.List;

public class AppDataSnapshot {
    public List<Transaction> transactions = new ArrayList<>();
    public List<Category> categories = new ArrayList<>();
    public List<RecurringBill> recurringBills = new ArrayList<>();
    public List<SavingsGoal> savingsGoals = new ArrayList<>();
    public boolean darkTheme = false;
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/repository/JsonStorageRepository.java',
    name: 'JsonStorageRepository.java',
    layer: 'Repository',
    language: 'java',
    oopHighlight: 'Persistent JSON repository with polymorphic Transaction adapter and atomic file replacement.',
    content: `package com.smartexpense.repository;

import com.google.gson.*;
import com.smartexpense.model.Expense;
import com.smartexpense.model.Income;
import com.smartexpense.model.Transaction;

import java.io.IOException;
import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDate;

/**
 * Handles automatic persistent file storage in the user's home directory
 * using atomic file moves to avoid partial writes on sudden shutdown.
 */
public class JsonStorageRepository {

    private final Path storagePath;
    private final Gson gson;

    public JsonStorageRepository(Path storagePath) {
        this.storagePath = storagePath;
        this.gson = new GsonBuilder()
                .setPrettyPrinting()
                .registerTypeAdapter(LocalDate.class, new LocalDateAdapter())
                .registerTypeAdapter(Transaction.class, new PolymorphicTransactionAdapter())
                .create();
    }

    public static JsonStorageRepository defaultUserStorage() {
        Path defaultDir = Path.of(System.getProperty("user.home"), ".smart-expense-tracker");
        return new JsonStorageRepository(defaultDir.resolve("ledger-data.json"));
    }

    public AppDataSnapshot load() {
        if (!Files.exists(storagePath)) {
            return new AppDataSnapshot();
        }
        try {
            String json = Files.readString(storagePath, StandardCharsets.UTF_8);
            AppDataSnapshot snapshot = gson.fromJson(json, AppDataSnapshot.class);
            return snapshot != null ? snapshot : new AppDataSnapshot();
        } catch (IOException | JsonParseException ex) {
            System.err.println("Could not load saved data, starting clean: " + ex.getMessage());
            return new AppDataSnapshot();
        }
    }

    public void save(AppDataSnapshot snapshot) {
        try {
            Path parent = storagePath.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            Path tempFile = storagePath.resolveSibling(storagePath.getFileName() + ".tmp");
            Files.writeString(tempFile, gson.toJson(snapshot), StandardCharsets.UTF_8);
            Files.move(tempFile, storagePath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException ex) {
            try {
                Path tempFile = storagePath.resolveSibling(storagePath.getFileName() + ".tmp");
                Files.move(tempFile, storagePath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException inner) {
                throw new IllegalStateException("Failed to persist application data", inner);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to persist application data", ex);
        }
    }

    private static final class LocalDateAdapter
            implements JsonSerializer<LocalDate>, JsonDeserializer<LocalDate> {
        @Override
        public JsonElement serialize(LocalDate src, Type typeOfSrc, JsonSerializationContext ctx) {
            return new JsonPrimitive(src.toString());
        }

        @Override
        public LocalDate deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext ctx) {
            return LocalDate.parse(json.getAsString());
        }
    }

    /** Preserves concrete subclass (Expense vs Income) during JSON round-trip. */
    private static final class PolymorphicTransactionAdapter
            implements JsonSerializer<Transaction>, JsonDeserializer<Transaction> {

        @Override
        public JsonElement serialize(Transaction src, Type typeOfSrc, JsonSerializationContext ctx) {
            JsonObject obj = new JsonObject();
            obj.addProperty("kind", src.getType().name());
            obj.addProperty("id", src.getId());
            obj.addProperty("title", src.getTitle());
            obj.addProperty("amount", src.getAmount().toPlainString());
            obj.addProperty("categoryId", src.getCategoryId());
            obj.addProperty("date", src.getDate().toString());
            obj.addProperty("notes", src.getNotes());

            switch (src) {
                case Expense e -> {
                    obj.addProperty("paymentMethod", e.getPaymentMethod());
                    obj.addProperty("recurring", e.isRecurring());
                }
                case Income i -> obj.addProperty("source", i.getSource());
            }
            return obj;
        }

        @Override
        public Transaction deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext ctx) {
            JsonObject obj = json.getAsJsonObject();
            String kind = obj.get("kind").getAsString();
            String id = obj.get("id").getAsString();
            String title = obj.get("title").getAsString();
            BigDecimal amount = new BigDecimal(obj.get("amount").getAsString());
            String categoryId = obj.get("categoryId").getAsString();
            LocalDate date = LocalDate.parse(obj.get("date").getAsString());
            String notes = obj.has("notes") ? obj.get("notes").getAsString() : "";

            return switch (kind) {
                case "INCOME" -> new Income(
                        id, title, amount, categoryId, date, notes,
                        obj.has("source") ? obj.get("source").getAsString() : "Direct Transfer"
                );
                default -> new Expense(
                        id, title, amount, categoryId, date, notes,
                        obj.has("paymentMethod") ? obj.get("paymentMethod").getAsString() : "Debit Card",
                        obj.has("recurring") && obj.get("recurring").getAsBoolean()
                );
            };
        }
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/service/BudgetAlertObserver.java',
    name: 'BudgetAlertObserver.java',
    layer: 'Service',
    language: 'java',
    oopHighlight: 'Observer Pattern interface notifying UI controllers whenever monthly spending alerts change.',
    content: `package com.smartexpense.service;

import com.smartexpense.model.BudgetAlert;

import java.util.List;

@FunctionalInterface
public interface BudgetAlertObserver {
    void onBudgetAlertsUpdated(List<BudgetAlert> activeAlerts);
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/service/TransactionSortStrategy.java',
    name: 'TransactionSortStrategy.java',
    layer: 'Service',
    language: 'java',
    oopHighlight: 'Strategy Pattern enum supplying interchangeable Comparator strategies for transaction sorting.',
    content: `package com.smartexpense.service;

import com.smartexpense.model.Transaction;

import java.util.Comparator;
import java.util.Map;

public enum TransactionSortStrategy {
    DATE_DESC("Date (Newest First)"),
    DATE_ASC("Date (Oldest First)"),
    AMOUNT_DESC("Amount (High to Low)"),
    AMOUNT_ASC("Amount (Low to High)"),
    CATEGORY_ASC("Category (A to Z)");

    private final String label;

    TransactionSortStrategy(String label) {
        this.label = label;
    }

    public Comparator<Transaction> comparator(Map<String, String> categoryNames) {
        return switch (this) {
            case DATE_DESC -> Comparator.comparing(Transaction::getDate).reversed();
            case DATE_ASC -> Comparator.comparing(Transaction::getDate);
            case AMOUNT_DESC -> Comparator.comparing(Transaction::getAmount).reversed();
            case AMOUNT_ASC -> Comparator.comparing(Transaction::getAmount);
            case CATEGORY_ASC -> Comparator.comparing(
                    t -> categoryNames.getOrDefault(t.getCategoryId(), ""),
                    String.CASE_INSENSITIVE_ORDER
            );
        };
    }

    @Override
    public String toString() {
        return label;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/service/TransactionFilterCriteria.java',
    name: 'TransactionFilterCriteria.java',
    layer: 'Service',
    language: 'java',
    oopHighlight: 'Specification record & Predicate matcher for keyword, type, category, and date range filtering.',
    content: `package com.smartexpense.service;

import com.smartexpense.model.Transaction;
import com.smartexpense.model.TransactionType;

import java.time.LocalDate;
import java.util.Locale;

public record TransactionFilterCriteria(
        String keyword,
        TransactionType type,
        String categoryId,
        LocalDate startDate,
        LocalDate endDate
) {
    public static TransactionFilterCriteria empty() {
        return new TransactionFilterCriteria("", null, null, null, null);
    }

    public boolean matches(Transaction tx) {
        if (type != null && tx.getType() != type) {
            return false;
        }
        if (categoryId != null && !categoryId.isBlank() && !categoryId.equals(tx.getCategoryId())) {
            return false;
        }
        if (startDate != null && tx.getDate().isBefore(startDate)) {
            return false;
        }
        if (endDate != null && tx.getDate().isAfter(endDate)) {
            return false;
        }
        if (keyword != null && !keyword.isBlank()) {
            String q = keyword.trim().toLowerCase(Locale.ROOT);
            boolean inTitle = tx.getTitle().toLowerCase(Locale.ROOT).contains(q);
            boolean inNotes = tx.getNotes().toLowerCase(Locale.ROOT).contains(q);
            boolean inDetail = tx.getDetailLabel().toLowerCase(Locale.ROOT).contains(q);
            return inTitle || inNotes || inDetail;
        }
        return true;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/service/ReportExporter.java',
    name: 'ReportExporter.java',
    layer: 'Service',
    language: 'java',
    oopHighlight: 'Strategy Pattern interface for open/closed financial report exporting (CSV, TXT, future PDF).',
    content: `package com.smartexpense.service;

import com.smartexpense.model.Category;
import com.smartexpense.model.FinancialSummary;
import com.smartexpense.model.Transaction;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public interface ReportExporter {
    String fileExtension();
    void export(
            Path destination,
            List<Transaction> transactions,
            List<Category> categories,
            FinancialSummary summary
    ) throws IOException;
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/service/CsvReportExporter.java',
    name: 'CsvReportExporter.java',
    layer: 'Service',
    language: 'java',
    oopHighlight: 'Concrete CSV Strategy implementation with RFC-4180 cell escaping.',
    content: `package com.smartexpense.service;

import com.smartexpense.model.Category;
import com.smartexpense.model.FinancialSummary;
import com.smartexpense.model.Transaction;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CsvReportExporter implements ReportExporter {

    @Override
    public String fileExtension() {
        return "*.csv";
    }

    @Override
    public void export(
            Path destination,
            List<Transaction> transactions,
            List<Category> categories,
            FinancialSummary summary
    ) throws IOException {
        Map<String, String> catNames = categories.stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        StringBuilder sb = new StringBuilder();
        sb.append("ID,Date,Type,Title,Category,SignedAmount,Detail,Notes\\n");

        for (Transaction tx : transactions) {
            sb.append(escape(tx.getId())).append(',')
              .append(tx.getDate()).append(',')
              .append(tx.getType()).append(',')
              .append(escape(tx.getTitle())).append(',')
              .append(escape(catNames.getOrDefault(tx.getCategoryId(), "Uncategorized"))).append(',')
              .append(tx.signedAmount().toPlainString()).append(',')
              .append(escape(tx.getDetailLabel())).append(',')
              .append(escape(tx.getNotes())).append('\\n');
        }

        sb.append("\\nTotal Income,").append(summary.totalIncome().toPlainString()).append('\\n');
        sb.append("Total Expense,").append(summary.totalExpense().toPlainString()).append('\\n');
        sb.append("Net Balance,").append(summary.netBalance().toPlainString()).append('\\n');
        sb.append("Savings Rate (%),").append(String.format("%.1f%%", summary.savingsRatePercent())).append('\\n');

        Files.writeString(destination, sb.toString(), StandardCharsets.UTF_8);
    }

    private String escape(String raw) {
        String safe = raw == null ? "" : raw.replace("\\"", "\\"\\"");
        return (safe.contains(",") || safe.contains("\\"") || safe.contains("\\n"))
                ? "\\"" + safe + "\\"" : safe;
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/service/TextReportExporter.java',
    name: 'TextReportExporter.java',
    layer: 'Service',
    language: 'java',
    oopHighlight: 'Concrete Plain-Text Strategy implementation formatting aligned ledger reports.',
    content: `package com.smartexpense.service;

import com.smartexpense.model.Category;
import com.smartexpense.model.FinancialSummary;
import com.smartexpense.model.Transaction;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TextReportExporter implements ReportExporter {

    @Override
    public String fileExtension() {
        return "*.txt";
    }

    @Override
    public void export(
            Path destination,
            List<Transaction> transactions,
            List<Category> categories,
            FinancialSummary summary
    ) throws IOException {
        Map<String, String> catNames = categories.stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        StringBuilder sb = new StringBuilder();
        sb.append("============================================================\\n");
        sb.append("          SMART EXPENSE & BUDGET TRACKER SUMMARY            \\n");
        sb.append("============================================================\\n");
        sb.append(String.format("Generated Date : %s%n", LocalDate.now()));
        sb.append(String.format("Total Income   : $%s%n", summary.totalIncome().toPlainString()));
        sb.append(String.format("Total Expense  : $%s%n", summary.totalExpense().toPlainString()));
        sb.append(String.format("Net Balance    : $%s%n", summary.netBalance().toPlainString()));
        sb.append(String.format("Savings Rate   : %.1f%%%n", summary.savingsRatePercent()));
        sb.append("------------------------------------------------------------\\n");

        for (Transaction tx : transactions) {
            sb.append(String.format(
                    "%s | %-7s | %-18s | %10s | %s%n",
                    tx.getDate(),
                    tx.getType(),
                    catNames.getOrDefault(tx.getCategoryId(), "Other"),
                    tx.signedAmount().toPlainString(),
                    tx.getTitle()
            ));
        }

        Files.writeString(destination, sb.toString(), StandardCharsets.UTF_8);
    }
}
`,
  },
  {
    path: 'src/main/java/com/smartexpense/service/FinanceService.java',
    name: 'FinanceService.java',
    layer: 'Service',
    language: 'java',
    oopHighlight: 'Core application service coordinating domain rules, Observer alerts, monthly aggregations, and auto-persistence.',
    content: `package com.smartexpense.service;

import com.smartexpense.model.*;
import com.smartexpense.repository.AppDataSnapshot;
import com.smartexpense.repository.JsonStorageRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

public class FinanceService {

    private final JsonStorageRepository storage;
    private final List<Transaction> transactions = new ArrayList<>();
    private final List<Category> categories = new ArrayList<>();
    private final List<RecurringBill> recurringBills = new ArrayList<>();
    private final List<SavingsGoal> savingsGoals = new ArrayList<>();
    private final List<BudgetAlertObserver> alertObservers = new ArrayList<>();
    private boolean darkTheme;

    public FinanceService(JsonStorageRepository storage) {
        this.storage = Objects.requireNonNull(storage);
        loadFromStorage();
    }

    private void loadFromStorage() {
        AppDataSnapshot snapshot = storage.load();
        transactions.clear();
        categories.clear();
        recurringBills.clear();
        savingsGoals.clear();

        if (snapshot.categories.isEmpty()) {
            seedDefaultCategories();
            persist();
        } else {
            categories.addAll(snapshot.categories);
            transactions.addAll(snapshot.transactions);
            recurringBills.addAll(snapshot.recurringBills);
            savingsGoals.addAll(snapshot.savingsGoals);
            darkTheme = snapshot.darkTheme;
        }
    }

    private void seedDefaultCategories() {
        categories.add(new Category("cat-food", "Food & Dining", TransactionType.EXPENSE, new BigDecimal("420"), "#0F766E"));
        categories.add(new Category("cat-transport", "Transport", TransactionType.EXPENSE, new BigDecimal("160"), "#0284C7"));
        categories.add(new Category("cat-bills", "Bills & Utilities", TransactionType.EXPENSE, new BigDecimal("320"), "#D97706"));
        categories.add(new Category("cat-shopping", "Shopping", TransactionType.EXPENSE, new BigDecimal("250"), "#7C3AED"));
        categories.add(new Category("cat-education", "Education", TransactionType.EXPENSE, new BigDecimal("300"), "#2563EB"));
        categories.add(new Category("cat-freelance", "Freelance", TransactionType.INCOME, BigDecimal.ZERO, "#16A34A"));
        categories.add(new Category("cat-stipend", "Stipend / Salary", TransactionType.INCOME, BigDecimal.ZERO, "#0D9488"));
    }

    public void addAlertObserver(BudgetAlertObserver observer) {
        alertObservers.add(observer);
    }

    public void addOrUpdateTransaction(Transaction tx) {
        transactions.removeIf(existing -> existing.getId().equals(tx.getId()));
        transactions.add(tx);
        persistAndNotify(YearMonth.from(tx.getDate()));
    }

    public void deleteTransaction(String id) {
        transactions.removeIf(t -> t.getId().equals(id));
        persistAndNotify(YearMonth.now());
    }

    public List<Transaction> queryTransactions(
            TransactionFilterCriteria criteria,
            TransactionSortStrategy sortStrategy
    ) {
        Map<String, String> catNames = categories.stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));
        return transactions.stream()
                .filter(criteria::matches)
                .sorted(sortStrategy.comparator(catNames))
                .toList();
    }

    public void saveCategory(Category category) {
        categories.removeIf(c -> c.getId().equals(category.getId()));
        categories.add(category);
        persistAndNotify(YearMonth.now());
    }

    public void deleteCategory(String categoryId) {
        categories.removeIf(c -> c.getId().equals(categoryId));
        persistAndNotify(YearMonth.now());
    }

    public void saveBill(RecurringBill bill) {
        recurringBills.removeIf(b -> b.getId().equals(bill.getId()));
        recurringBills.add(bill);
        persist();
    }

    public void deleteBill(String billId) {
        recurringBills.removeIf(b -> b.getId().equals(billId));
        persist();
    }

    /** Marks a recurring bill paid and automatically logs a corresponding Expense. */
    public Expense payRecurringBill(String billId) {
        RecurringBill bill = recurringBills.stream()
                .filter(b -> b.getId().equals(billId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Bill not found: " + billId));

        Expense logged = new Expense(
                null,
                bill.getTitle(),
                bill.getAmount(),
                bill.getCategoryId(),
                LocalDate.now(),
                "Paid recurring " + bill.getFrequency().name().toLowerCase() + " bill",
                "Auto-Pay",
                true
        );
        bill.markPaidAndAdvance();
        transactions.add(logged);
        persistAndNotify(YearMonth.now());
        return logged;
    }

    public void saveGoal(SavingsGoal goal) {
        savingsGoals.removeIf(g -> g.getId().equals(goal.getId()));
        savingsGoals.add(goal);
        persist();
    }

    public void contributeToGoal(String goalId, BigDecimal amount) {
        SavingsGoal goal = savingsGoals.stream()
                .filter(g -> g.getId().equals(goalId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Goal not found: " + goalId));
        goal.contribute(amount);
        persist();
    }

    public void deleteGoal(String goalId) {
        savingsGoals.removeIf(g -> g.getId().equals(goalId));
        persist();
    }

    public FinancialSummary calculateSummary(List<Transaction> scope) {
        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;

        for (Transaction tx : scope) {
            switch (tx) {
                case Income i -> income = income.add(i.getAmount());
                case Expense e -> expense = expense.add(e.getAmount());
            }
        }

        BigDecimal net = income.subtract(expense);
        double savingsRate = income.compareTo(BigDecimal.ZERO) > 0
                ? net.divide(income, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                : 0.0;

        return new FinancialSummary(income, expense, net, savingsRate);
    }

    public Map<String, BigDecimal> expenseTotalsByCategory(YearMonth month) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        for (Transaction tx : transactions) {
            if (tx instanceof Expense e && YearMonth.from(e.getDate()).equals(month)) {
                totals.merge(e.getCategoryId(), e.getAmount(), BigDecimal::add);
            }
        }
        return totals;
    }

    public List<BudgetAlert> evaluateBudgetAlerts(YearMonth month) {
        Map<String, BigDecimal> spentByCategory = expenseTotalsByCategory(month);
        List<BudgetAlert> alerts = new ArrayList<>();

        for (Category cat : categories) {
            if (cat.getType() != TransactionType.EXPENSE) continue;
            if (cat.getMonthlyBudgetLimit().compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal spent = spentByCategory.getOrDefault(cat.getId(), BigDecimal.ZERO);
            double ratio = spent.divide(cat.getMonthlyBudgetLimit(), 4, RoundingMode.HALF_UP).doubleValue();

            if (ratio >= 1.0) {
                alerts.add(new BudgetAlert(
                        cat.getId(), cat.getName(), spent, cat.getMonthlyBudgetLimit(),
                        ratio, BudgetAlert.Severity.EXCEEDED
                ));
            } else if (ratio >= 0.8) {
                alerts.add(new BudgetAlert(
                        cat.getId(), cat.getName(), spent, cat.getMonthlyBudgetLimit(),
                        ratio, BudgetAlert.Severity.WARNING
                ));
            }
        }
        return alerts;
    }

    public List<Transaction> getAllTransactions() { return Collections.unmodifiableList(transactions); }
    public List<Category> getAllCategories() { return Collections.unmodifiableList(categories); }
    public List<RecurringBill> getAllBills() { return Collections.unmodifiableList(recurringBills); }
    public List<SavingsGoal> getAllGoals() { return Collections.unmodifiableList(savingsGoals); }

    public boolean isDarkTheme() { return darkTheme; }
    public void setDarkTheme(boolean darkTheme) {
        this.darkTheme = darkTheme;
        persist();
    }

    private void persistAndNotify(YearMonth month) {
        persist();
        List<BudgetAlert> alerts = evaluateBudgetAlerts(month);
        for (BudgetAlertObserver observer : alertObservers) {
            observer.onBudgetAlertsUpdated(alerts);
        }
    }

    private void persist() {
        AppDataSnapshot snapshot = new AppDataSnapshot();
        snapshot.transactions.addAll(transactions);
        snapshot.categories.addAll(categories);
        snapshot.recurringBills.addAll(recurringBills);
        snapshot.savingsGoals.addAll(savingsGoals);
        snapshot.darkTheme = darkTheme;
        storage.save(snapshot);
    }
}
`,
  },
  {
    path: 'src/test/java/com/smartexpense/service/FinanceServiceTest.java',
    name: 'FinanceServiceTest.java',
    layer: 'Tests',
    language: 'java',
    oopHighlight: 'JUnit 5 automated tests verifying sealed polymorphism, budget alerts, filtering, and persistence.',
    content: `package com.smartexpense.service;

import com.smartexpense.model.*;
import com.smartexpense.repository.JsonStorageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FinanceServiceTest {

    @Test
    void triggersBudgetAlertObserverWhenMonthlyLimitExceeded(@TempDir Path tempDir) {
        JsonStorageRepository repo = new JsonStorageRepository(tempDir.resolve("test-data.json"));
        FinanceService service = new FinanceService(repo);

        List<BudgetAlert> received = new ArrayList<>();
        service.addAlertObserver(alerts -> {
            received.clear();
            received.addAll(alerts);
        });

        service.addOrUpdateTransaction(new Expense(
                null, "Team Dinner", new BigDecimal("450.00"),
                "cat-food", LocalDate.now(), "Exceeded 420 food budget", "Credit Card", false
        ));

        assertFalse(received.isEmpty());
        assertEquals(BudgetAlert.Severity.EXCEEDED, received.getFirst().severity());
        assertEquals("Food & Dining", received.getFirst().categoryName());
    }

    @Test
    void calculatesSummaryAndPersistsPolymorphicTransactions(@TempDir Path tempDir) {
        Path file = tempDir.resolve("persist.json");
        FinanceService service = new FinanceService(new JsonStorageRepository(file));

        service.addOrUpdateTransaction(new Income(
                null, "Freelance App", new BigDecimal("1000.00"),
                "cat-freelance", LocalDate.now(), "Milestone 1", "Bank Transfer"
        ));
        service.addOrUpdateTransaction(new Expense(
                null, "Textbooks", new BigDecimal("250.00"),
                "cat-education", LocalDate.now(), "OOP Lab", "Debit Card", false
        ));

        // Reload from disk to prove polymorphic Expense/Income round-trip
        FinanceService reloaded = new FinanceService(new JsonStorageRepository(file));
        FinancialSummary summary = reloaded.calculateSummary(reloaded.getAllTransactions());

        assertEquals(new BigDecimal("1000.00"), summary.totalIncome());
        assertEquals(new BigDecimal("250.00"), summary.totalExpense());
        assertEquals(new BigDecimal("750.00"), summary.netBalance());
        assertEquals(75.0, summary.savingsRatePercent(), 0.01);
        assertEquals(2, reloaded.getAllTransactions().size());
        assertTrue(reloaded.evaluateBudgetAlerts(YearMonth.now()).size() <= 1);
    }
}
`,
  },
];
