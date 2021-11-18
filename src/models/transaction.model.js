export class TransactionModel {
    id;
    transactionTypeName;
    amount;
    transactionStatusName;
    transactionSpecialization;
    sourceId;
    targetId;
    statusTime;
    notes;

    constructor(id, transactionTypeName, transactionSpecialization, amount, transactionStatusName, sourceId, targetId, statusTime, notes) {
        this.id = id;
        this.transactionTypeName = transactionTypeName;
        this.transactionSpecialization = transactionSpecialization;
        this.amount = amount;
        this.transactionStatusName = transactionStatusName;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.statusTime = statusTime;
        this.notes = notes;
    }

    static from({id, transactionTypeName, transactionSpecialization, amount, transactionStatusName, sourceId, targetId, statusTime, notes}){
        return new TransactionModel(id, transactionTypeName, transactionSpecialization, amount, transactionStatusName, sourceId, targetId, statusTime, notes)
    }
}
