// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ShrimpEscrow
 * @notice Hop dong ky quy cho san giao dich tom B2B.
 * Farmer dang lo hang, Buyer dat coc, giai ngan tu dong khi Buyer xac nhan
 * hoac tu dong sau thoi han time-lock neu Buyer khong phan hoi.
 */
contract ShrimpEscrow {
    enum LotStatus { Listed, Locked, Released, Refunded }

    struct Lot {
        address farmer;
        address buyer;
        string cid;              // ma CID tren IPFS (bang chung video/anh goc)
        uint256 quantity;        // so luong (don vi: kg, luu dang so nguyen x100 de tranh so thap phan)
        uint256 price;           // gia tien ky quy (don vi: wei cua token thanh toan, hoac native token)
        uint256 lockedAt;        // thoi diem buyer dat coc
        LotStatus status;
    }

    // lotId (tu MySQL) => thong tin luu on-chain
    mapping(uint256 => Lot) public lots;

    uint256 public constant TIME_LOCK_DURATION = 14 days;

    event LotListed(uint256 indexed lotId, address indexed farmer, string cid, uint256 price);
    event LotLocked(uint256 indexed lotId, address indexed buyer, uint256 amount);
    event LotReleased(uint256 indexed lotId, address indexed farmer, uint256 amount);
    event LotRefunded(uint256 indexed lotId, address indexed buyer, uint256 amount);

    modifier onlyFarmer(uint256 lotId) {
        require(lots[lotId].farmer == msg.sender, "Chi Farmer cua lo nay moi duoc goi");
        _;
    }

    modifier onlyBuyer(uint256 lotId) {
        require(lots[lotId].buyer == msg.sender, "Chi Buyer cua lo nay moi duoc goi");
        _;
    }

    /**
     * @notice Farmer dang lo hang len blockchain.
     */
    function createListing(
        uint256 lotId,
        string calldata cid,
        uint256 quantity,
        uint256 price
    ) external {
        require(lots[lotId].farmer == address(0), "Lo hang da ton tai");
        require(price > 0, "Gia phai lon hon 0");

        lots[lotId] = Lot({
            farmer: msg.sender,
            buyer: address(0),
            cid: cid,
            quantity: quantity,
            price: price,
            lockedAt: 0,
            status: LotStatus.Listed
        });

        emit LotListed(lotId, msg.sender, cid, price);
    }

    /**
     * @notice Buyer dat coc - khoa tien vao contract (native token, vd MATIC/POL).
     */
    function deposit(uint256 lotId) external payable {
        Lot storage lot = lots[lotId];
        require(lot.status == LotStatus.Listed, "Lo hang khong o trang thai Listed");
        require(msg.value == lot.price, "So tien gui khong dung gia niem yet");
        require(msg.sender != lot.farmer, "Farmer khong the tu mua lo cua minh");

        lot.buyer = msg.sender;
        lot.lockedAt = block.timestamp;
        lot.status = LotStatus.Locked;

        emit LotLocked(lotId, msg.sender, msg.value);
    }

    /**
     * @notice Buyer xac nhan da nhan hang -> giai ngan cho Farmer.
     */
    function confirmReceived(uint256 lotId) external onlyBuyer(lotId) {
        Lot storage lot = lots[lotId];
        require(lot.status == LotStatus.Locked, "Lo hang khong o trang thai Locked");

        lot.status = LotStatus.Released;
        uint256 amount = lot.price;

        (bool sent, ) = lot.farmer.call{value: amount}("");
        require(sent, "Chuyen tien that bai");

        emit LotReleased(lotId, lot.farmer, amount);
    }

    /**
     * @notice Farmer rut tien sau khi het thoi han time-lock (14 ngay)
     * neu Buyer khong xac nhan nhan hang.
     */
    function withdraw(uint256 lotId) external onlyFarmer(lotId) {
        Lot storage lot = lots[lotId];
        require(lot.status == LotStatus.Locked, "Lo hang khong o trang thai Locked");
        require(block.timestamp >= lot.lockedAt + TIME_LOCK_DURATION, "Chua het thoi han time-lock");

        lot.status = LotStatus.Released;
        uint256 amount = lot.price;

        (bool sent, ) = lot.farmer.call{value: amount}("");
        require(sent, "Chuyen tien that bai");

        emit LotReleased(lotId, lot.farmer, amount);
    }

    /**
     * @notice Ham xem thong tin lo hang.
     */
    function getLot(uint256 lotId) external view returns (Lot memory) {
        return lots[lotId];
    }
}