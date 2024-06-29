package sg.edu.nus.iss.backend.repo;

public interface LoginQueries {
    
    public final static String INSERT_USER = 
    """
    INSERT into user (username, password, email, firstname, lastname, gender, token) values (?,?,?,?,?,?,?)         
    """;

    public final static String CHECK_USERNAME = 
    """
    SELECT username FROM user WHERE username=?
    """;

    public final static String GET_TOKEN = 
    """
    SELECT token FROM user WHERE username=? and password=?        
    """;

    public final static String CHECK_TOKEN = 
    """
    SELECT username FROM user WHERE token=?   
    """;
}

// SELECT SupplierName
// FROM Suppliers
// WHERE EXISTS (SELECT ProductName FROM Products WHERE Products.SupplierID = Suppliers.supplierID AND Price < 20);