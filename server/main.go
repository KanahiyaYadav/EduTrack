package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Student struct {
	gorm.Model
	Name       string
	Math       int
	Science    int
	English    int
	Attendance int
}

var db *gorm.DB

func initDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = db.AutoMigrate(&Student{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
}

// Utility to safely parse integers from strings
func safeParseInt(value string) int {
	var i int
	_, err := fmt.Sscanf(strings.TrimSpace(value), "%d", &i)
	if err != nil {
		return 0
	}
	return i
}

func main() {
	initDB()
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.POST("/upload", func(c *gin.Context) {
		var students []map[string]string
		if err := c.BindJSON(&students); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		fmt.Println("Received data:", students) // Add this line

		for _, data := range students {
			fmt.Println("Raw row:", data) // Add this too

			student := Student{
				Name:       data["Name"],
				Math:       safeParseInt(data["Math"]),
				Science:    safeParseInt(data["Science"]),
				English:    safeParseInt(data["English"]),
				Attendance: safeParseInt(data["Attendance"]),
			}
			println("Parsed row:", student.Attendance)
			println("Name:", student.Name)
			db.Create(&student)
		}

		c.JSON(http.StatusOK, gin.H{"message": "Data saved to database", "count": len(students)})
	})

	router.GET("/students", func(c *gin.Context) {
		var students []Student
		result := db.Find(&students)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
		c.JSON(http.StatusOK, students)
	})

	router.GET("/analytics", func(c *gin.Context) {
		var students []Student
		result := db.Find(&students)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		uniqueMap := map[string]Student{}
		for _, s := range students {
			uniqueMap[s.Name] = s
		}

		var inputData []map[string]interface{}
		for _, s := range uniqueMap {
			record := map[string]interface{}{
				"Name":       s.Name,
				"Math":       s.Math,
				"Science":    s.Science,
				"English":    s.English,
				"Attendance": s.Attendance,
			}
			inputData = append(inputData, record)
		}

		jsonData, _ := json.Marshal(inputData)

		cmd := exec.Command("python", "analytics/analyze.py")
		cmd.Stdin = bytes.NewReader(jsonData)
		var out bytes.Buffer
		cmd.Stdout = &out

		if err := cmd.Run(); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		var resultData map[string]interface{}
		if err := json.Unmarshal(out.Bytes(), &resultData); err != nil {
			c.JSON(500, gin.H{"error": "Invalid JSON from Python"})
			return
		}

		c.JSON(200, resultData)
	})

	router.Run(":8080")
}
